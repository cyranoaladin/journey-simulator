import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Met à jour automatiquement les blocs auto-générés du README:
 * - phases-table
 * - file-index
 * - api-surface
 *
 * Usage (depuis journey-simulator/):
 *   node scripts/update-readme-autogen.mjs
 *
 * Usage (depuis la racine monorepo):
 *   node journey-simulator/scripts/update-readme-autogen.mjs
 */

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
const readmePath = path.join(monorepoRoot, 'journey-simulator/README.md');
const scriptsDir = path.join(monorepoRoot, 'journey-simulator/scripts');

const runScript = (scriptName) => {
  const scriptPath = path.join(scriptsDir, scriptName);
  const stdout = execFileSync(process.execPath, [scriptPath], {
    cwd: monorepoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  return stdout.trimEnd();
};

const replaceBlock = (readme, marker, replacementBlock) => {
  const startMarker = `<!-- BEGIN AUTO-GENERATED: ${marker} -->`;
  const endMarker = `<!-- END AUTO-GENERATED: ${marker} -->`;
  const startIdx = readme.indexOf(startMarker);
  const endIdx = readme.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(`Marker block not found in README: ${marker}`);
  }
  const before = readme.slice(0, startIdx);
  const after = readme.slice(endIdx + endMarker.length);
  return `${before}${replacementBlock}${after}`;
};

const main = () => {
 const blocks = [
    { marker: 'phases-table', script: 'generate-phases-table.mjs' },
    { marker: 'steps-by-journey', script: 'generate-steps-by-journey.mjs' },
    { marker: 'agents-registry', script: 'generate-agents-registry.mjs' },
    { marker: 'file-index', script: 'generate-file-index.mjs' },
    { marker: 'api-surface', script: 'generate-api-surface.mjs' },
  ];

  let readme = fs.readFileSync(readmePath, 'utf8');

  for (const b of blocks) {
    const output = runScript(b.script);
    // Sanity: ensure the generator output contains the expected marker
    if (!output.includes(`<!-- BEGIN AUTO-GENERATED: ${b.marker} -->`) || !output.includes(`<!-- END AUTO-GENERATED: ${b.marker} -->`)) {
      console.warn(`Warning: generator ${b.script} missing markers for ${b.marker}; skipping update`);
      continue;
    }
    readme = replaceBlock(readme, b.marker, output);
  }

  fs.writeFileSync(readmePath, readme, 'utf8');
  process.stdout.write(`Updated README auto-generated blocks: ${blocks.map((b) => b.marker).join(', ')}\n`);
};

main();
