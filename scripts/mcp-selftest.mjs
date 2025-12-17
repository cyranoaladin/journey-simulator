#!/usr/bin/env node
/**
 * Minimal MCP stdio self-test (outside Cursor) to prove servers are operational.
 *
 * It spawns each MCP server declared in mcp.json, performs:
 * - initialize + initialized
 * - tools/list
 * - a couple of representative tools/calls (best-effort)
 *
 * This is intentionally dependency-free (no @modelcontextprotocol/sdk).
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';

const ROOT = '/home/alaeddine/Documents/journey_mfai_back_front';
const MCP_JSON = `${ROOT}/mcp.json`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function withTimeout(promise, ms, label) {
  let t;
  const timeout = new Promise((_, rej) => {
    t = setTimeout(() => rej(new Error(`Timeout after ${ms}ms: ${label}`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

function createStdioClient({ name, command, args, env }) {
  const child = spawn(command, args, {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, ...(env || {}) },
  });

  let nextId = 1;
  const pending = new Map(); // id -> {resolve,reject}
  const buffer = { stdout: '', stderr: '' };

  function onLine(line) {
    if (!line.trim()) return;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      // Non-JSON output; ignore but keep for debugging
      buffer.stdout += line + '\n';
      return;
    }
    if (msg && typeof msg.id !== 'undefined' && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  }

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    buffer.stdout += chunk;
    const lines = buffer.stdout.split('\n');
    buffer.stdout = lines.pop() ?? '';
    for (const line of lines) onLine(line);
  });

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => {
    buffer.stderr += chunk;
  });

  function send(obj) {
    child.stdin.write(JSON.stringify(obj) + '\n');
  }

  function request(method, params) {
    const id = nextId++;
    send({ jsonrpc: '2.0', id, method, params });
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
    });
  }

  async function initialize() {
    // Try common protocol versions (servers can be strict)
    const versions = ['2024-11-05', '2024-10-07', '2024-09-01'];
    let lastErr;
    for (const v of versions) {
      try {
        const result = await withTimeout(
          request('initialize', {
            protocolVersion: v,
            capabilities: {},
            clientInfo: { name: 'mcp-selftest', version: '0.1.0' },
          }),
          8000,
          `${name}:initialize(${v})`
        );
        // Per spec: client sends initialized notification
        send({ jsonrpc: '2.0', method: 'initialized', params: {} });
        return result;
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr;
  }

  async function close() {
    try {
      child.kill('SIGTERM');
    } catch {
      // ignore
    }
    await sleep(100);
  }

  return { name, child, request, initialize, close, buffer };
}

async function main() {
  const cfg = JSON.parse(fs.readFileSync(MCP_JSON, 'utf8'));
  const servers = cfg.servers || [];

  console.log(`MCP self-test using ${MCP_JSON}`);
  console.log(`Servers: ${servers.map((s) => s.name).join(', ')}`);

  for (const s of servers) {
    console.log(`\n=== [${s.name}] spawn ===`);
    const client = createStdioClient({
      name: s.name,
      command: s.command,
      args: s.args,
      env: s.env,
    });

    try {
      const init = await client.initialize();
      console.log(`initialize: OK (server: ${init?.serverInfo?.name || 'unknown'})`);

      const tools = await withTimeout(client.request('tools/list', {}), 8000, `${s.name}:tools/list`);
      const toolNames = (tools?.tools || []).map((t) => t.name);
      console.log(`tools/list: OK (${toolNames.length} tools)`);
      console.log(`tools: ${toolNames.slice(0, 15).join(', ')}${toolNames.length > 15 ? ', ...' : ''}`);

      // Best-effort calls
      if (s.name === 'filesystem_ro') {
        const readTool =
          toolNames.find((n) => n === 'read_file') ||
          toolNames.find((n) => n.toLowerCase().includes('read') && n.toLowerCase().includes('file'));
        if (readTool) {
          console.log(`\n[filesystem] call ${readTool} docs/ARCHITECTURE.md`);
          const r1 = await withTimeout(
            client.request('tools/call', {
              name: readTool,
              arguments: { path: `${ROOT}/docs/ARCHITECTURE.md` },
            }),
            8000,
            `${s.name}:read docs/ARCHITECTURE.md`
          );
          console.log(`read allowed file: OK (content blocks: ${(r1?.content || []).length})`);

          console.log(`[filesystem] security test: attempt read ${ROOT}/.env (should fail)`);
          try {
            await withTimeout(
              client.request('tools/call', { name: readTool, arguments: { path: `${ROOT}/.env` } }),
              8000,
              `${s.name}:read root .env`
            );
            console.log('SECURITY FAIL: root .env was readable (unexpected)');
          } catch {
            console.log('security: OK (root .env not readable)');
          }
        } else {
          console.log('filesystem: no read_file-like tool found; skipped calls');
        }
      }

      if (s.name === 'postgres_ro') {
        const queryTool = toolNames.find((n) => n === 'query') || toolNames.find((n) => n.includes('query'));
        if (queryTool) {
          const queryToolDef = (tools?.tools || []).find((t) => t.name === queryTool);
          const schemaProps = Object.keys(queryToolDef?.inputSchema?.properties || {});
          // server-postgres expects {query: "..."} (but some versions use {sql: "..."}).
          const queryKey = schemaProps.includes('query') ? 'query' : schemaProps.includes('sql') ? 'sql' : 'query';

          await withTimeout(
            client.request('tools/call', { name: queryTool, arguments: { [queryKey]: 'SELECT 1 AS ok' } }),
            8000,
            `${s.name}:query SELECT 1`
          );
          console.log(`postgres SELECT 1: OK (arg key: ${queryKey})`);
          // Best-effort MintLog read (may vary)
          try {
            await withTimeout(
              client.request('tools/call', {
                name: queryTool,
                arguments: { [queryKey]: 'SELECT * FROM \"MintLog\" ORDER BY \"createdAt\" DESC LIMIT 5' },
              }),
              8000,
              `${s.name}:query MintLog`
            );
            console.log('postgres MintLog (5 latest): OK');
          } catch {
            console.log('postgres MintLog query: skipped (table/columns may differ)');
          }
        } else {
          console.log('postgres: no query tool found; skipped calls');
        }
      }

      if (s.name === 'fetch') {
        const fetchTool = toolNames.find((n) => n === 'fetch') || toolNames.find((n) => n.includes('fetch'));
        if (fetchTool) {
          const f1 = await withTimeout(
            client.request('tools/call', { name: fetchTool, arguments: { url: 'https://docs.login.xyz/' } }),
            15000,
            `${s.name}:fetch`
          );
          console.log(`fetch: OK (content blocks: ${(f1?.content || []).length})`);
        } else {
          console.log('fetch: no fetch tool found; skipped calls');
        }
      }

      if (s.name === 'git') {
        // Tool names vary by server-git version; list_tools output is the proof here.
        console.log('git: OK (tools listed)');
      }
    } catch (e) {
      console.log(`ERROR: ${s.name} self-test failed`);
      console.log(String(e?.message || e));
      if (client.buffer.stderr) {
        console.log('\n--- stderr ---');
        console.log(client.buffer.stderr.trimEnd());
      }
      process.exitCode = 1;
    } finally {
      await client.close();
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


