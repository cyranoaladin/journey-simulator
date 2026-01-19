/* (c) 2025 - Money Factory AI. Developed by Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA. All rights reserved. */
/**
 * fix-r1.js
 * Supprime les caractères non-ASCII dans journey-simulator/src et mf-back/agents.
 */
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const TARGETS = [
  path.join(ROOT, 'journey-simulator', 'src'),
  path.join(ROOT, 'mf-back', 'agents'),
];

const exts = new Set(['.ts', '.tsx', '.js', '.jsx']);

async function walk(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.next') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...await walk(full));
    else if (exts.has(path.extname(e.name))) files.push(full);
  }
  return files;
}

async function sanitize(file) {
  const orig = await fsp.readFile(file, 'utf8');
  const cleaned = orig.replace(/[^\x00-\x7F]/g, '');
  if (cleaned !== orig) {
    await fsp.writeFile(file, cleaned, 'utf8');
  }
}

async function main() {
  for (const base of TARGETS) {
    const files = await walk(base);
    for (const f of files) {
      await sanitize(f);
    }
  }
}

main().catch((err) => {
  console.error('[fix-r1] failed', err);
  process.exit(1);
});
