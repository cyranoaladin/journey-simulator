#!/usr/bin/env node
/**
 * Lightweight MCP server (stdio) to fetch external documentation (read-only).
 * Security: HTTPS-only, blocks localhost/private-ish targets.
 */

const MAX_BYTES_DEFAULT = 500_000; // keep responses bounded

function reply(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
}

function error(id, code, message) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n');
}

function textResult(text) {
  return { content: [{ type: 'text', text }] };
}

function isBlockedHost(hostname) {
  const h = (hostname || '').toLowerCase();
  if (h === 'localhost' || h === '127.0.0.1' || h === '::1') return true;
  if (h.endsWith('.local')) return true;
  // Very lightweight private ranges check for common literals
  if (h.startsWith('10.') || h.startsWith('192.168.') || h.startsWith('172.16.')) return true;
  return false;
}

const tools = [
  {
    name: 'fetch',
    description: 'Fetch une URL HTTPS (doc publique) et retourne le body en texte (tronqué).',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        maxBytes: { type: 'number' },
      },
      required: ['url'],
      additionalProperties: false,
    },
  },
];

async function fetchText(url, maxBytes) {
  const u = new URL(url);
  if (u.protocol !== 'https:') throw new Error('Only https:// URLs are allowed');
  if (isBlockedHost(u.hostname)) throw new Error('Blocked host');

  const res = await fetch(u.toString(), {
    redirect: 'follow',
    headers: {
      'user-agent': 'journey-fetch-mcp/0.1.0',
      accept: 'text/html,application/json,text/plain,*/*',
    },
  });
  const ct = res.headers.get('content-type') || '';
  const ab = await res.arrayBuffer();
  const bytes = Buffer.from(ab);
  const limit = Math.max(1, Math.min(maxBytes || MAX_BYTES_DEFAULT, 2_000_000));
  const sliced = bytes.subarray(0, limit);
  const text = sliced.toString('utf8');
  const meta = `HTTP ${res.status} ${res.statusText}\ncontent-type: ${ct}\nbytes: ${bytes.length} (returned ${sliced.length})\n\n`;
  return meta + text;
}

async function handle(req) {
  const { id, method, params } = req;
  try {
    if (method === 'initialize') {
      return reply(id, {
        protocolVersion: params?.protocolVersion,
        serverInfo: { name: 'journey-fetch-mcp', version: '0.1.0' },
        capabilities: { tools: {} },
      });
    }
    if (method === 'tools/list') {
      return reply(id, { tools });
    }
    if (method === 'tools/call') {
      const toolName = params?.name;
      if (toolName !== 'fetch') return error(id, -32601, `Unknown tool: ${toolName}`);
      const url = params?.arguments?.url;
      const maxBytes = params?.arguments?.maxBytes;
      const out = await fetchText(url, maxBytes);
      return reply(id, textResult(out));
    }
    if (typeof id !== 'undefined') return error(id, -32601, `Unknown method: ${method}`);
  } catch (e) {
    return error(id, -32000, String(e?.message || e));
  }
}

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buf += chunk;
  const lines = buf.split('\n');
  buf = lines.pop() ?? '';
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    let req;
    try {
      req = JSON.parse(t);
    } catch {
      continue;
    }
    void handle(req);
  }
});


