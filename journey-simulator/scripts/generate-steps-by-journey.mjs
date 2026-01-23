import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';

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
const tsPath = path.join(monorepoRoot, 'journey-simulator/node_modules/typescript');
const ts = require(tsPath);

const transpileToCjs = (sourcePath, outPath) => {
  const src = fs.readFileSync(sourcePath, 'utf8');
  const output = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
    }
  }).outputText;
  fs.writeFileSync(outPath, output, 'utf8');
};

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mfai-steps-'));
const demoSrc = path.join(monorepoRoot, 'journey-simulator/src/store/demoSequencer.ts');
const personasSrc = path.join(monorepoRoot, 'journey-simulator/src/data/personas.ts');
const demoOut = path.join(tmpDir, 'demoSequencer.cjs');
const personasOut = path.join(tmpDir, 'personas.cjs');

transpileToCjs(demoSrc, demoOut);
transpileToCjs(personasSrc, personasOut);

process.env.NODE_ENV = 'production';
const personas = require(personasOut).personas;
const { getDemoSequence } = require(demoOut);

const lines = [];
lines.push('<!-- BEGIN AUTO-GENERATED: steps-by-journey -->');

for (const persona of personas) {
  const sequence = getDemoSequence(persona.id);
  if (!sequence || sequence.length === 0) continue;
  lines.push(`### Persona: ${persona.title} (\`${persona.id}\`)`);
  lines.push('');

  const phases = [];
  for (const step of sequence) {
    const pid = step?.metadata?.phase_id;
    if (pid && !phases.includes(pid)) phases.push(pid);
  }

  for (const phaseId of phases) {
    lines.push(`#### Phase: \`${phaseId}\``);
    lines.push('');
    lines.push('| # | Step title | Summary | UI blocks | Agent actions |');
    lines.push('|---:|---|---|---|---|');
    const steps = sequence.filter((s) => s.metadata?.phase_id === phaseId);
    steps.forEach((step, idx) => {
      const title = String(step?.metadata?.title || '').replace(/\|/g, '\\|');
      const summary = String(step?.metadata?.summary || '').replace(/\|/g, '\\|');
      const blocks = Array.isArray(step?.ui_blocks)
        ? step.ui_blocks.map((b) => `\`${b.kind}\``).join(', ')
        : '';
      const actions = Array.isArray(step?.agent_actions)
        ? step.agent_actions.map((a) => `\`${a.agent_name}\``).join(', ')
        : '';
      lines.push(`${idx + 1} | ${title} | ${summary} | ${blocks || '—'} | ${actions || '—'}`);
    });
    lines.push('');
  }

  lines.push('');
}

lines.push('<!-- END AUTO-GENERATED: steps-by-journey -->');
process.stdout.write(lines.join('\n') + '\n');
