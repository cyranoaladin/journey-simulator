#!/usr/bin/env node
/**
 * Strict allowlist filesystem MCP server (stdio) — READ ONLY.
 *
 * Security goals:
 * - Only allows reads under explicit allowlisted directories (realpath-checked)
 * - Denies any `.env*` reads even if accidentally present
 * - No write/edit/move tools exposed
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// tools/mcp/* -> repo root
const DEFAULT_ROOT = path.resolve(__dirname, '../..');

function resolveFromRoot(p) {
  return path.isAbsolute(p) ? p : path.resolve(DEFAULT_ROOT, p);
}

// Allowlist inputs may be directories OR individual files.
// - Directories: allow reads under the directory (realpath-checked)
// - Files: allow reads of that exact file only (no parent directory widening)
const allowedPaths = process.argv.slice(2).filter(Boolean).map(resolveFromRoot);
const allowedDirRealpaths = [];
const allowedFileRealpaths = [];
for (const p of allowedPaths) {
  const rp = await fs.realpath(p);
  const st = await fs.stat(rp);
  if (st.isDirectory()) allowedDirRealpaths.push(rp);
  else if (st.isFile()) allowedFileRealpaths.push(rp);
  else throw new Error(`allowed-path is neither directory nor file: ${p}`);
}

function reply(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
}

function error(id, code, message) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n');
}

function textResult(text) {
  return { content: [{ type: 'text', text }] };
}

function isEnvLike(p) {
  const base = path.basename(p);
  return base === '.env' || base.startsWith('.env.');
}

function isPathAllowed(realFilePath) {
  // Exact file allowlist
  if (allowedFileRealpaths.includes(realFilePath)) return true;

  // Directory allowlist (prefix match)
  const normalized = realFilePath.endsWith(path.sep) ? realFilePath : realFilePath + path.sep;
  for (const dir of allowedDirRealpaths) {
    const dirNorm = dir.endsWith(path.sep) ? dir : dir + path.sep;
    if (normalized.startsWith(dirNorm)) return true;
  }
  return false;
}

async function resolveSafe(userPath) {
  const abs = path.isAbsolute(userPath) ? userPath : path.resolve(process.cwd(), userPath);
  if (isEnvLike(abs)) throw new Error('Access denied (.env*)');
  const rp = await fs.realpath(abs);
  if (isEnvLike(rp)) throw new Error('Access denied (.env*)');
  if (!isPathAllowed(rp)) throw new Error('Access denied (not in allowlist)');
  return rp;
}

const tools = [
  {
    name: 'read_file',
    description: 'Lit un fichier texte (read-only) sous allowlist.',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string' } },
      required: ['path'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_directory',
    description: 'Liste un dossier (read-only) sous allowlist.',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string' } },
      required: ['path'],
      additionalProperties: false,
    },
  },
  {
    name: 'search_files',
    description: 'Recherche un motif (regex JS) dans les fichiers texte sous allowlist (limité).',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        pattern: { type: 'string' },
        maxResults: { type: 'number' },
      },
      required: ['path', 'pattern'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_allowed_directories',
    description: 'Retourne la liste des répertoires allowlistés.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
];

async function handle(req) {
  const { id, method, params } = req;
  try {
    if (method === 'initialize') {
      return reply(id, {
        protocolVersion: params?.protocolVersion,
        serverInfo: { name: 'journey-filesystem-ro', version: '0.1.0' },
        capabilities: { tools: {} },
      });
    }
    if (method === 'tools/list') return reply(id, { tools });
    if (method === 'tools/call') {
      const toolName = params?.name;
      const args = params?.arguments || {};

      if (toolName === 'list_allowed_directories') {
        // Back-compat: historically this returned only directories.
        return reply(id, textResult(allowedDirRealpaths.join('\n')));
      }

      if (toolName === 'read_file') {
        const rp = await resolveSafe(args.path);
        const content = await fs.readFile(rp, 'utf8');
        return reply(id, textResult(content));
      }

      if (toolName === 'list_directory') {
        const rp = await resolveSafe(args.path);
        const st = await fs.stat(rp);
        if (!st.isDirectory()) throw new Error('Not a directory');
        const entries = await fs.readdir(rp, { withFileTypes: true });
        const out = entries
          .map((e) => `${e.isDirectory() ? 'd' : 'f'} ${e.name}`)
          .sort((a, b) => a.localeCompare(b))
          .join('\n');
        return reply(id, textResult(out));
      }

      if (toolName === 'search_files') {
        const base = await resolveSafe(args.path);
        const normalizedPattern = String(args.pattern || '').toLowerCase();
        const max = Math.max(1, Math.min(Number(args.maxResults || 50), 200));
        const results = [];

        const baseStat = await fs.stat(base);
        if (baseStat.isFile()) {
          try {
            const txt = await fs.readFile(base, 'utf8');
            if (txt.toLowerCase().includes(normalizedPattern)) results.push(base);
          } catch {
            // ignore binary/unreadable
          }
          return reply(id, textResult(results.join('\n')));
        }

        async function walk(dir) {
          if (results.length >= max) return;
          const entries = await fs.readdir(dir, { withFileTypes: true });
          for (const e of entries) {
            if (results.length >= max) return;
            const p = path.join(dir, e.name);
            // Ignore binary assets in search
            if (/\.(png|jpg|jpeg|gif|ico|pdf|woff|woff2|ttf|eot|mp4|webm|mp3|zip|gz|tar)$/i.test(e.name)) continue;

            if (e.isDirectory()) {
              await walk(p);
            } else if (!isEnvLike(p)) {
              try {
                const txt = await fs.readFile(p, 'utf8');
                if (txt.toLowerCase().includes(normalizedPattern)) results.push(p);
              } catch {
                // ignore binary/unreadable
              }
            }
          }
        }
        await walk(base);
        return reply(id, textResult(results.join('\n')));
      }

      return error(id, -32601, `Unknown tool: ${toolName}`);
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
