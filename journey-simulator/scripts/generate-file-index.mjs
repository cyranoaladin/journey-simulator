import fs from 'node:fs';
import path from 'node:path';

/**
 * Génère un index Markdown "fichier par fichier" du monorepo (frontend + backend + infra),
 * avec un rôle court par fichier, pour compléter le README sans oubli.
 *
 * Usage (depuis journey-simulator/):
 *   node scripts/generate-file-index.mjs
 *
 * Usage (depuis la racine du monorepo):
 *   node journey-simulator/scripts/generate-file-index.mjs
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
  // Heuristique: remonter jusqu'à trouver mf-back/ et journey-simulator/
  const start = process.cwd();
  let current = start;
  for (let i = 0; i < 8; i++) {
    const hasMfBack = isDir(path.join(current, 'mf-back'));
    const hasJourney = isDir(path.join(current, 'journey-simulator'));
    if (hasMfBack && hasJourney) return current;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  // Fallback: si exécuté depuis journey-simulator/
  const candidate = path.resolve(start, '..');
  if (isDir(path.join(candidate, 'mf-back')) && isDir(path.join(candidate, 'journey-simulator'))) {
    return candidate;
  }
  throw new Error('Unable to locate monorepo root (expected mf-back/ and journey-simulator/)');
};

const monorepoRoot = findMonorepoRoot();

const IGNORE_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.next',
  '.cache',
  // local runtime artefacts (may be permission-restricted)
  'data',
  'reports',
  '.turbo',
  '.storybook-out',
  'playwright-report',
  'test-results',
]);

const shouldIgnorePath = (rel) => {
  const parts = normalizeSlashes(rel).split('/');
  // ignore runtime DB dirs explicitly (often created by docker/mongo)
  if (normalizeSlashes(rel).includes('/data/mongo/')) return true;
  if (normalizeSlashes(rel).includes('/.mongodb')) return true;
  return parts.some((p) => IGNORE_DIRS.has(p) || p.startsWith('.vite') || p === '');
};

const listFiles = (absDir, baseAbs) => {
  const out = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      // Permission denied / transient FS issues: skip subtree.
      return;
    }
    for (const ent of entries) {
      const abs = path.join(dir, ent.name);
      const rel = normalizeSlashes(path.relative(baseAbs, abs));
      if (shouldIgnorePath(rel)) continue;
      if (ent.isDirectory()) {
        walk(abs);
      } else if (ent.isFile()) {
        out.push(rel);
      }
    }
  };
  walk(absDir);
  return out.sort((a, b) => a.localeCompare(b));
};

const readFirstMeaningfulComment = (absFile) => {
  try {
    const raw = fs.readFileSync(absFile, 'utf8');
    const lines = raw.split(/\r?\n/);
    // Cherche un bloc /** ... */ ou une ligne // au tout début.
    for (let i = 0; i < Math.min(lines.length, 40); i++) {
      const l = lines[i].trim();
      if (!l) continue;
      if (l.startsWith('/**')) {
        const buf = [];
        for (let j = i; j < Math.min(lines.length, i + 20); j++) {
          const t = lines[j].trim().replace(/^\* ?/, '');
          if (t.startsWith('/**')) continue;
          if (t.endsWith('*/')) {
            const cleaned = t.replace('*/', '').trim();
            if (cleaned) buf.push(cleaned);
            break;
          }
          if (t) buf.push(t);
        }
        const text = buf.join(' ').trim();
        return text.length ? text.slice(0, 140) : null;
      }
      if (l.startsWith('//')) {
        const text = l.replace(/^\/\/\s?/, '').trim();
        return text.length ? text.slice(0, 140) : null;
      }
      // Stop: premier “vrai code” sans commentaire au dessus.
      break;
    }
  } catch {
    // ignore
  }
  return null;
};

const roleFromPath = (rel) => {
  const p = normalizeSlashes(rel);

  // Frontend (journey-simulator)
  if (p === 'journey-simulator/src/main.tsx') return 'Entrypoint React + BrowserRouter + polyfills.';
  if (p === 'journey-simulator/src/App.tsx') return 'Routeur (React Router) + providers + layout.';
  if (p.startsWith('journey-simulator/src/pages/')) return 'Page (route) React Router.';
  if (p.startsWith('journey-simulator/src/contexts/')) return 'Context React (auth, wallet, tutoriel, layout).';
  if (p.startsWith('journey-simulator/src/store/')) return 'Store Zustand (state management).';
  if (p.startsWith('journey-simulator/src/utils/')) return 'Utilitaire (API client, scores, export, blockchain, etc.).';
  if (p.startsWith('journey-simulator/src/api/')) return 'Client typé / wrappers API mf-back.';
  if (p.startsWith('journey-simulator/src/types/')) return 'Types TypeScript (contrats UI/Domain).';
  if (p.startsWith('journey-simulator/src/components/UIBlocks/')) return 'Renderer UI Blocks (LLM → UI).';
  if (p.startsWith('journey-simulator/src/components/Zyno/')) return 'Console Zyno (orchestration, logs, RAG admin, dashboards).';
  if (p.startsWith('journey-simulator/src/components/')) return 'Composant React UI.';
  if (p.startsWith('journey-simulator/tests/')) return 'Tests Playwright (E2E).';
  if (p.startsWith('journey-simulator/cypress/')) return 'Tests Cypress (optionnel/legacy).';
  if (p.startsWith('journey-simulator/docs/')) return 'Documentation (diagrammes, schémas, specs).';
  if (p.startsWith('journey-simulator/public/')) return 'Assets statiques servis par Vite/Nginx.';

  // Backend (mf-back)
  if (p === 'mf-back/app.js') return 'Entrypoint Express: middlewares + routes + probes + Mongo.';
  if (p === 'mf-back/server.js') return 'Bootstrap serveur (runtime).';
  if (p.startsWith('mf-back/routes/')) return 'Routes Express (endpoints HTTP).';
  if (p.startsWith('mf-back/controllers/')) return 'Controllers (logique métier des endpoints).';
  if (p.startsWith('mf-back/models/')) return 'Models MongoDB (Mongoose schemas).';
  if (p.startsWith('mf-back/services/')) return 'Services (state, métriques, simulation).';
  if (p.startsWith('mf-back/orchestration/')) return 'Orchestration Zyno (intent → agents → timeline).';
  if (p.startsWith('mf-back/agents/')) return 'Agent IA (spécialisé).';
  if (p.startsWith('mf-back/rag/')) return 'Client RAG (search/ingest + fallback).';
  if (p.startsWith('mf-back/middleware/')) return 'Middleware (auth, feature flags).';
  if (p.startsWith('mf-back/llm/')) return 'Intégration LLM (OpenAI/GPT-5, etc.).';
  if (p.startsWith('mf-back/__tests__/')) return 'Tests backend.';
  if (p.startsWith('mf-back/scripts/')) return 'Scripts utilitaires backend (RAG, verify flow).';

  // Infra monorepo
  if (p.startsWith('.github/workflows/')) return 'CI/CD (GitHub Actions).';
  if (p.startsWith('scripts/')) return 'Scripts monorepo (verify, smoke, deploy).';
  if (p.startsWith('docker-compose')) return 'Docker Compose (dev/prod).';
  if (p.endsWith('Dockerfile')) return 'Dockerfile (build image).';

  return 'Fichier du monorepo (voir chemin).';
};

const renderFileLine = (rel) => {
  const abs = path.join(monorepoRoot, rel);
  const inferred = roleFromPath(rel);
  const comment = readFirstMeaningfulComment(abs);
  const note = comment ? `${inferred} Note: ${comment}` : inferred;
  return `- \`${rel}\` — ${note}`;
};

const groupByPrefix = (files, prefixes) => {
  const groups = new Map();
  prefixes.forEach((p) => groups.set(p, []));
  const rest = [];
  for (const f of files) {
    const match = prefixes.find((p) => f.startsWith(p));
    if (match) groups.get(match).push(f);
    else rest.push(f);
  }
  return { groups, rest };
};

const renderDetails = (title, lines) => {
  const out = [];
  out.push('<details>');
  out.push(`<summary><strong>${title}</strong> (${lines.length})</summary>`);
  out.push('');
  lines.forEach((l) => out.push(l));
  out.push('');
  out.push('</details>');
  out.push('');
  return out;
};

const main = () => {
  const allFiles = listFiles(monorepoRoot, monorepoRoot);

  const sections = [];
  sections.push('<!-- BEGIN AUTO-GENERATED: file-index -->');
  sections.push('');
  sections.push('> Index auto-généré “fichier par fichier” du monorepo (frontend + backend + infra).');
  sections.push('');
  sections.push('Commande: `node journey-simulator/scripts/generate-file-index.mjs`');
  sections.push('');

  // Grouping strategy: focus on main domains, keep readable via <details>.
  const { groups, rest } = groupByPrefix(allFiles, [
    'journey-simulator/src/',
    'journey-simulator/tests/',
    'journey-simulator/docs/',
    'journey-simulator/public/',
    'mf-back/routes/',
    'mf-back/controllers/',
    'mf-back/models/',
    'mf-back/services/',
    'mf-back/orchestration/',
    'mf-back/agents/',
    'mf-back/rag/',
    'mf-back/middleware/',
    'mf-back/llm/',
    'mf-back/scripts/',
    'mf-back/__tests__/',
    '.github/workflows/',
    'scripts/',
  ]);

  const renderGroup = (prefix, title) => {
    const files = groups.get(prefix) ?? [];
    const lines = files.map(renderFileLine);
    sections.push(...renderDetails(title, lines));
  };

  renderGroup('journey-simulator/src/', 'journey-simulator/src (frontend)');
  renderGroup('journey-simulator/tests/', 'journey-simulator/tests (Playwright E2E)');
  renderGroup('journey-simulator/docs/', 'journey-simulator/docs (docs)');
  renderGroup('journey-simulator/public/', 'journey-simulator/public (assets)');

  renderGroup('mf-back/routes/', 'mf-back/routes (Express routes)');
  renderGroup('mf-back/controllers/', 'mf-back/controllers (business logic)');
  renderGroup('mf-back/models/', 'mf-back/models (Mongo schemas)');
  renderGroup('mf-back/services/', 'mf-back/services (services)');
  renderGroup('mf-back/orchestration/', 'mf-back/orchestration (Zyno orchestration)');
  renderGroup('mf-back/agents/', 'mf-back/agents (agents catalog)');
  renderGroup('mf-back/rag/', 'mf-back/rag (RAG clients)');
  renderGroup('mf-back/middleware/', 'mf-back/middleware (middlewares)');
  renderGroup('mf-back/llm/', 'mf-back/llm (LLM integration)');
  renderGroup('mf-back/scripts/', 'mf-back/scripts (utility scripts)');
  renderGroup('mf-back/__tests__/', 'mf-back/__tests__ (backend tests)');

  renderGroup('.github/workflows/', '.github/workflows (CI/CD)');
  renderGroup('scripts/', 'scripts (monorepo scripts)');

  // Remaining files (root configs, docker, etc.)
  const remaining = rest
    .filter((f) => !shouldIgnorePath(f))
    .map(renderFileLine);
  sections.push(...renderDetails('Autres fichiers (root / infra / configs)', remaining));

  sections.push('<!-- END AUTO-GENERATED: file-index -->');
  sections.push('');

  process.stdout.write(sections.join('\n'));
};

main()
