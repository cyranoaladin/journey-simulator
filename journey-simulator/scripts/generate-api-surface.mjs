import fs from 'node:fs';
import path from 'node:path';

/**
 * Génère un index auto des surfaces "API":
 * - Routes frontend (React Router) depuis `journey-simulator/src/App.tsx`
 * - Endpoints backend (Express) depuis `mf-back/app.js` + `mf-back/routes/*.js`
 *
 * Objectif: aucun endpoint/route ne doit rester implicite dans le code.
 *
 * Usage (depuis la racine monorepo):
 *   node journey-simulator/scripts/generate-api-surface.mjs
 *
 * Usage (depuis journey-simulator/):
 *   node scripts/generate-api-surface.mjs
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
const appTsx = path.join(monorepoRoot, 'journey-simulator/src/App.tsx');
const mfAppCandidates = [
  path.join(monorepoRoot, 'mf-back/src/app.ts'),
  path.join(monorepoRoot, 'mf-back/dist/app.js'),
  path.join(monorepoRoot, 'mf-back/app.js'),
];
const mfAppJs = mfAppCandidates.find((p) => fs.existsSync(p));
if (!mfAppJs) {
  throw new Error('Unable to locate mf-back app entrypoint (searching src/app.ts, dist/app.js, app.js)');
}
const mfRoutesDir =
  fs.existsSync(path.join(monorepoRoot, 'mf-back/src/routes')) &&
  fs.readdirSync(path.join(monorepoRoot, 'mf-back/src/routes')).length > 0
    ? path.join(monorepoRoot, 'mf-back/src/routes')
    : path.join(monorepoRoot, 'mf-back/routes');

const read = (p) => fs.readFileSync(p, 'utf8');

const uniq = (arr) => Array.from(new Set(arr));

// ----------------------------
// Frontend routes (React Router)
// ----------------------------
const parseFrontendRoutes = () => {
  const src = read(appTsx).split(/\r?\n/);
  const routes = [];

  let inProtectedBlock = false;
  for (const line of src) {
    if (line.includes('<Route element={<ProtectedLayout')) {
      inProtectedBlock = true;
      continue;
    }
    if (inProtectedBlock && line.includes('</Route>')) {
      // Note: in this file, this closing tag ends the protected wrapper block.
      inProtectedBlock = false;
      continue;
    }

    const m = line.match(/<Route\s+path=([\"'])(.+?)\1/);
    if (m) {
      const routePath = m[2];
      const normalized = routePath.startsWith('/') ? routePath : `/${routePath}`;
      routes.push({ path: normalized, protected: inProtectedBlock });
    }
  }

  // Deduplicate (keep protected=true if any instance is protected)
  const merged = new Map();
  for (const r of routes) {
    const prev = merged.get(r.path);
    if (!prev) merged.set(r.path, r);
    else merged.set(r.path, { ...prev, protected: prev.protected || r.protected });
  }

  return Array.from(merged.values()).sort((a, b) => a.path.localeCompare(b.path));
};

// ----------------------------
// Backend endpoints (Express)
// ----------------------------

const parseBackendMounts = () => {
  const src = read(mfAppJs).split(/\r?\n/);
  const mounts = [];

  // capture lines like: app.use('/journey', journeyRouter);
  const re = /app\.use\(\s*(['"`])([^'"`]+)\1\s*,\s*([A-Za-z0-9_]+)\s*\)/;
  for (const line of src) {
    const m = line.match(re);
    if (!m) continue;
    mounts.push({ mount: m[2], varName: m[3] });
  }

  // also capture direct app.get('/healthz'...) etc as endpoints
  const direct = [];
  const directRe = /app\.(get|post|put|delete|patch|options|all)\(\s*(['"`])([^'"`]+)\2/;
  for (const line of src) {
    const m = line.match(directRe);
    if (!m) continue;
    direct.push({ method: m[1].toUpperCase(), path: m[3], source: 'mf-back/app.js' });
  }

  return { mounts, direct };
};

const listRouteFiles = () => {
  if (!fs.existsSync(mfRoutesDir)) return [];
  const entries = fs.readdirSync(mfRoutesDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.js'))
    .map((e) => path.join(mfRoutesDir, e.name))
    .sort((a, b) => a.localeCompare(b));
};

const parseExpressRouterEndpoints = (routeFileAbs) => {
  const src = read(routeFileAbs);
  const fileRel = normalizeSlashes(path.relative(monorepoRoot, routeFileAbs));

  const endpoints = [];

  // router.get('/x', ...)
  const methodRe = /router\.(get|post|put|delete|patch|options|all)\(\s*(['"`])([^'"`]+)\2/g;
  let m;
  while ((m = methodRe.exec(src))) {
    endpoints.push({ method: m[1].toUpperCase(), path: m[3], source: fileRel });
  }

  // router.route('/x').get(...).post(...)
  const routeRe = /router\.route\(\s*(['"`])([^'"`]+)\1\s*\)([\s\S]{0,300})/g;
  let r;
  while ((r = routeRe.exec(src))) {
    const routePath = r[2];
    const chain = r[3] ?? '';
    const methods = uniq(
      Array.from(chain.matchAll(/\.(get|post|put|delete|patch|options|all)\(/g)).map((x) => x[1].toUpperCase()),
    );
    if (methods.length === 0) {
      endpoints.push({ method: 'ROUTE', path: routePath, source: fileRel });
    } else {
      methods.forEach((method) => endpoints.push({ method, path: routePath, source: fileRel }));
    }
  }

  return endpoints;
};

const joinPaths = (a, b) => {
  const left = a.endsWith('/') ? a.slice(0, -1) : a;
  const right = b.startsWith('/') ? b : `/${b}`;
  if (left === '') return right;
  if (left === '/') return right;
  return `${left}${right}`;
};

const buildBackendSurface = () => {
  const { mounts, direct } = parseBackendMounts();
  const routeFiles = listRouteFiles();
  const endpointsByFile = new Map();
  routeFiles.forEach((f) => endpointsByFile.set(f, parseExpressRouterEndpoints(f)));

  // Build mapping varName -> route file by searching require(...) assignments in app.js
  const appSrc = read(mfAppJs);
  const varToRequire = new Map();
  const requireRe = /const\s+([A-Za-z0-9_]+)\s*=\s*require\(\s*['"`]\.\/(routes\/[^'"`]+)['"`]\s*\)/g;
  let m;
  while ((m = requireRe.exec(appSrc))) {
    const raw = `mf-back/${m[2]}`;
    const normalized = raw.endsWith('.js') ? raw : `${raw}.js`;
    varToRequire.set(m[1], normalized);
  }

  const computed = [];

  // Mounted routers: mount + router paths
  for (const mount of mounts) {
    const rel = varToRequire.get(mount.varName);
    if (!rel) {
      computed.push({
        method: 'MOUNT',
        path: mount.mount,
        source: `mf-back/app.js (mount ${mount.varName})`,
      });
      continue;
    }
    const abs = path.join(monorepoRoot, rel);
    const entries = endpointsByFile.get(abs) ?? [];
    if (entries.length === 0) {
      computed.push({ method: 'MOUNT', path: mount.mount, source: rel });
      continue;
    }
    for (const e of entries) {
      computed.push({
        method: e.method,
        path: joinPaths(mount.mount, e.path),
        source: e.source,
      });
    }
  }

  // Direct app.get(...) endpoints
  direct.forEach((d) => computed.push(d));

  // Normalize + dedupe (method+path)
  const dedup = new Map();
  for (const e of computed) {
    const key = `${e.method} ${e.path}`;
    if (!dedup.has(key)) dedup.set(key, e);
  }

  return Array.from(dedup.values()).sort((a, b) => {
    const k1 = `${a.path} ${a.method}`;
    const k2 = `${b.path} ${b.method}`;
    return k1.localeCompare(k2);
  });
};

// ----------------------------
// Render markdown
// ----------------------------
const main = () => {
  const fe = parseFrontendRoutes();
  const be = buildBackendSurface();

  const out = [];
  out.push('<!-- BEGIN AUTO-GENERATED: api-surface -->');
  out.push('');
  out.push('> Index auto-généré des surfaces API: routes frontend + endpoints backend.');
  out.push('');
  out.push('Commande: `node journey-simulator/scripts/generate-api-surface.mjs`');
  out.push('');

  out.push('### Routes frontend (React Router)');
  out.push('');
  out.push('| Route | Protégée (auth) | Source |');
  out.push('|---|---|---|');
  fe.forEach((r) => {
    out.push(`| \`${r.path}\` | ${r.protected ? '✅' : '—'} | \`journey-simulator/src/App.tsx\` |`);
  });
  out.push('');

  out.push('### Endpoints backend (Express)');
  out.push('');
  out.push('| Method | Path | Source (route file) |');
  out.push('|---|---|---|');
  be.forEach((e) => {
    out.push(`| \`${e.method}\` | \`${e.path}\` | \`${e.source}\` |`);
  });
  out.push('');

  // Highlight potential double-prefix issues for visibility
  out.push('### Notes (cohérence)');
  out.push('');
  out.push('- Cet index reflète **le câblage actuel** (mounts dans `mf-back/app.js`).');
  out.push('- Si une route semble “doublée” (ex: `/orchestration/orchestration`), cela indique un **mismatch** entre le `mount` et le `router.*(\"/...\")` dans le fichier de routes.');
  out.push('');

  out.push('<!-- END AUTO-GENERATED: api-surface -->');
  out.push('');

  process.stdout.write(out.join('\n'));
};

main();
