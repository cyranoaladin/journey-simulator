import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

/**
 * Génère une table Markdown "Persona × Phases" depuis `src/data/personas.ts`.
 *
 * Objectif: documenter "chaque phase de chaque parcours" sans recopier manuellement.
 *
 * Usage:
 *   node journey-simulator/scripts/generate-phases-table.mjs
 */

const repoRoot = path.resolve(process.cwd(), 'journey-simulator');
const personasPath = path.resolve(repoRoot, 'src/data/personas.ts');

const readPersonas = () => {
  const src = fs.readFileSync(personasPath, 'utf8');

  // `src/data/personas.ts` est un module TS très proche de JS: on supprime imports + annotations TS.
  // On évite toute dépendance (ts-node/tsx) en évaluant le tableau via `vm`.
  const withoutImports = src.replace(/^\s*import\s+.*$/gm, '');

  // Retire l'annotation TS " : Persona[] " sur l'export.
  const normalizedExport = withoutImports.replace(
    /export\s+const\s+personas\s*:\s*Persona\[\]\s*=\s*\[/,
    'const personas = [',
  );

  const wrapped = `${normalizedExport}\n;module.exports = { personas };\n`;
  const sandbox = { module: { exports: {} }, exports: {} };
  vm.runInNewContext(wrapped, sandbox, { filename: personasPath });

  const personas = sandbox.module.exports.personas;
  if (!Array.isArray(personas)) {
    throw new Error('Failed to load personas array from personas.ts');
  }
  return personas;
};

const escapePipes = (value) => String(value ?? '').replace(/\|/g, '\\|').trim();

const formatBool = (value) => (value ? '✅' : '—');
const formatNumber = (value) => (typeof value === 'number' && Number.isFinite(value) ? String(value) : '—');

const main = () => {
  const personas = readPersonas();

  const lines = [];
  lines.push('<!-- BEGIN AUTO-GENERATED: phases-table -->');
  lines.push('');
  lines.push(
    '> Ce tableau est généré automatiquement depuis `src/data/personas.ts`.',
  );
  lines.push('');
  lines.push(
    'Commande: `node journey-simulator/scripts/generate-phases-table.mjs`',
  );
  lines.push('');

  for (const persona of personas) {
    const personaId = escapePipes(persona?.id);
    const personaTitle = escapePipes(persona?.title ?? persona?.name ?? personaId);
    const phases = Array.isArray(persona?.phases) ? persona.phases : [];

    lines.push(`### Persona: ${personaTitle} (\`${personaId}\`)`);
    lines.push('');

    lines.push(
      '| # | phase.id | Titre | Mission (résumé) | XP | $MFAI | NFT reward | stakingRequired | daoVoteRequired |',
    );
    lines.push('|---:|---|---|---|---:|---:|---|---:|---|');

    phases.forEach((phase, index) => {
      lines.push(
        [
          index + 1,
          `\`${escapePipes(phase?.id)}\``,
          escapePipes(phase?.title),
          escapePipes(phase?.mission),
          formatNumber(phase?.xpReward),
          formatNumber(phase?.mfaiReward),
          escapePipes(phase?.nftReward),
          formatNumber(phase?.stakingRequired),
          formatBool(phase?.daoVoteRequired),
        ].join(' | ') + ' |',
      );
    });

    if (phases.length === 0) {
      lines.push('| — | — | — | — | — | — | — | — | — |');
    }

    lines.push('');
  }

  lines.push('<!-- END AUTO-GENERATED: phases-table -->');
  lines.push('');

  process.stdout.write(lines.join('\n'));
};

main();
