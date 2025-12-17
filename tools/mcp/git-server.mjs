#!/usr/bin/env node
/**
 * Lightweight MCP server (stdio) for local git operations (read-only).
 * No external deps; uses `git` CLI.
 */

import { execFile } from 'node:child_process';

const REPO = '/home/alaeddine/Documents/journey_mfai_back_front';

function reply(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
}

function error(id, code, message) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n');
}

function textResult(text) {
  return { content: [{ type: 'text', text }] };
}

function runGit(args) {
  return new Promise((resolve, reject) => {
    execFile('git', ['-C', REPO, ...args], { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve(stdout);
    });
  });
}

const tools = [
  {
    name: 'git_status',
    description: 'Affiche git status (porcelain) du repo (read-only).',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'git_diff_last_commit',
    description: 'Affiche le diff du dernier commit (équivalent à `git show -1`).',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
];

async function handle(req) {
  const { id, method, params } = req;
  try {
    if (method === 'initialize') {
      return reply(id, {
        protocolVersion: params?.protocolVersion,
        serverInfo: { name: 'journey-git-mcp', version: '0.1.0' },
        capabilities: { tools: {} },
      });
    }
    if (method === 'tools/list') {
      return reply(id, { tools });
    }
    if (method === 'tools/call') {
      const toolName = params?.name;
      if (toolName === 'git_status') {
        const out = await runGit(['status', '--porcelain=v1']);
        return reply(id, textResult(out.trimEnd() || '(clean)'));
      }
      if (toolName === 'git_diff_last_commit') {
        const out = await runGit(['show', '-1', '--patch', '--stat']);
        return reply(id, textResult(out.trimEnd()));
      }
      return error(id, -32601, `Unknown tool: ${toolName}`);
    }
    // Ignore notifications like "initialized"
    if (typeof id !== 'undefined') return error(id, -32601, `Unknown method: ${method}`);
  } catch (e) {
    return error(id, -32000, String(e?.message || e));
  }
}

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', async (chunk) => {
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
    // Fire-and-forget; requests are independent
    void handle(req);
  }
});


