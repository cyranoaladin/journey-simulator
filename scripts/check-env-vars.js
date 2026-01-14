/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

#!/usr/bin/env node
/**
 * Script de vérification des variables d'environnement
 * Usage: node scripts/check-env-vars.js
 */

const fs = require('fs');
const path = require('path');

// Fonction simple pour parser un fichier .env
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Retirer les guillemets si présents
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        env[key] = value;
      }
    }
  });
  return env;
}

// Charger les fichiers .env (si disponibles)
const envFiles = [
  path.resolve(__dirname, '../mf-back/.env'),
  path.resolve(__dirname, '../.env'),
];

envFiles.forEach(envFile => {
  const env = parseEnvFile(envFile);
  Object.assign(process.env, env);
});

const required = {
  critical: ['NODE_ENV', 'MONGO_URI', 'JWT_SECRET', 'ADMIN_API_KEY'],
  rag: ['RAG_SEARCH_URL', 'RAG_API_KEY'],
  llm: ['OPENAI_API_KEY'],
};

const optional = {
  rag: ['RAG_INGEST_URL', 'RAG_COLLECTION', 'RAG_DATA_PATH', 'RAG_HEALTH_URL'],
  llm: ['LLM_MODEL_NAME', 'LLM_TEMPERATURE', 'LLM_MAX_OUTPUT_TOKENS'],
  execution: ['EXECUTION_ENABLED', 'REAL_EXECUTION_MODE', 'DEMO_MODE'],
  security: ['KILL_SWITCH', 'KILL_SWITCH_SCOPE'],
};

console.log('🔍 Vérification des variables d\'environnement\n');

let hasErrors = false;
let hasWarnings = false;

// Vérification des variables critiques
console.log('📋 Variables Critiques:');
required.critical.forEach(v => {
  if (!process.env[v]) {
    console.log(`  ❌ ${v} - MANQUANTE`);
    hasErrors = true;
  } else {
    const value = v.includes('SECRET') || v.includes('KEY') ? '***' : process.env[v];
    console.log(`  ✅ ${v} = ${value}`);
  }
});

// Vérification RAG
console.log('\n🔍 Variables RAG:');
required.rag.forEach(v => {
  if (!process.env[v]) {
    console.log(`  ⚠️  ${v} - Non définie (utilisera fallback local)`);
    hasWarnings = true;
  } else {
    const value = v.includes('KEY') ? '***' : process.env[v];
    console.log(`  ✅ ${v} = ${value}`);
  }
});
optional.rag.forEach(v => {
  if (process.env[v]) {
    const value = v.includes('KEY') ? '***' : process.env[v];
    console.log(`  ℹ️  ${v} = ${value}`);
  }
});

// Vérification LLM
console.log('\n🤖 Variables LLM:');
if (!process.env[required.llm[0]]) {
  console.log(`  ⚠️  ${required.llm[0]} - Non définie (utilisera mode mock)`);
  hasWarnings = true;
} else {
  console.log(`  ✅ ${required.llm[0]} = ***`);
}
optional.llm.forEach(v => {
  if (process.env[v]) {
    console.log(`  ℹ️  ${v} = ${process.env[v]}`);
  }
});

// Résumé
console.log('\n📊 Résumé:');
if (hasErrors) {
  console.log('  ❌ Des variables critiques sont manquantes');
  process.exit(1);
} else if (hasWarnings) {
  console.log('  ⚠️  Certaines variables optionnelles sont manquantes (fallback activé)');
  console.log('  ✅ Le système fonctionnera en mode dégradé');
  process.exit(0);
} else {
  console.log('  ✅ Toutes les variables sont définies');
  process.exit(0);
}
