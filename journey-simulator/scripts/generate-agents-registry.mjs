import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const normalizeSlashes = (p) => p.replace(/\\/g, '/');

const isDir = (p) => {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
};

const findMonorepoRoot = () => {
  const start = process.cwd();
  let current = start;
  for (let i = 0; i < 8; i++) {
    if (isDir(path.join(current, 'mf-back')) && isDir(path.join(current, 'journey-simulator'))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  const candidate = path.resolve(start, '..');
  if (isDir(path.join(candidate, 'mf-back')) && isDir(path.join(candidate, 'journey-simulator'))) {
    return candidate;
  }
  throw new Error('Unable to locate monorepo root (expected mf-back/ and journey-simulator/)');
};

const monorepoRoot = findMonorepoRoot();
const require = createRequire(import.meta.url);
const registryPath = path.join(monorepoRoot, 'mf-back/src/agents/registry.js');
const registry = require(registryPath);

const map = new Map();
registry.forEach((a) => {
  map.set(a.agentId, a);
});

const unique = Array.from(map.values()).sort((a, b) => (b.priority || 0) - (a.priority || 0));

const lines = [];
lines.push('<!-- BEGIN AUTO-GENERATED: agents-registry -->');
lines.push('| Agent ID | Domain | Intents | Capabilities | requiresRag | enabled | priority | model | maxTokens | timeoutMs |');
lines.push('|---|---|---|---|---:|---:|---:|---|---:|---:|');

unique.forEach((a) => {
  const intents = (a.intents || []).map((i) => `\`${i}\``).join(', ');
  const caps = (a.capabilities || []).map((c) => `\`${c}\``).join(', ');
  const model = a.llmProfile?.model || a.defaultModel || '';
  lines.push(
    `| \`${a.agentId}\` | ${a.domain || '—'} | ${intents || '—'} | ${caps || '—'} | ${a.requiresRag ? 'true' : 'false'} | ${a.enabled === false ? 'false' : 'true'} | ${a.priority ?? '—'} | ${model || '—'} | ${a.maxTokens ?? '—'} | ${a.timeoutMs ?? '—'} |`
  );
});

lines.push('<!-- END AUTO-GENERATED: agents-registry -->');
process.stdout.write(lines.join('\n') + '\n');
