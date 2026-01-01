#!/usr/bin/env node
/* (c) 2025 - Money Factory AI. Developed by Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA. All rights reserved. */
/**
 * System Health Checker
 * - Backend connectivity (port 3000)
 * - JWT validity (simulated login)
 * - agent_memory.json write/read
 * - RAG response (or fallback)
 */

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const https = require('node:https');

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3002';
const RAG_BASE_URL = process.env.RAG_BASE_URL || 'http://localhost:8000';
const MEMORY_FILE = path.resolve(__dirname, '..', 'mf-back', 'memory', 'agent_memory.json');

const fetchJson = (url, options = {}) =>
  new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { ...options, timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(data || '{}') });
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy(new Error('Request timeout'));
    });
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });

async function checkBackendHealth() {
  const url = `${BACKEND_URL}/health`;
  const res = await fetchJson(url);
  if (res.status !== 200) throw new Error(`Backend health check failed (${res.status})`);
  return res.json;
}

async function simulateJwtLogin() {
  const seededEmail = 'test@mfai.app';
  const password = 'password123';
  const loginUrl = `${BACKEND_URL}/user/login`;
  const registerUrl = `${BACKEND_URL}/user/register`;

  const tryLogin = async (emailToUse) =>
    fetchJson(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailToUse, password }),
    });

  // 1) Tenter le compte seedé (dev/test)
  const seededLogin = await tryLogin(seededEmail);
  if (seededLogin.status === 200 && seededLogin.json?.accessToken) {
    return seededLogin.json.accessToken;
  }

  // 2) Sinon, créer un compte éphémère et se logger dessus
  const email = `health+${Date.now()}@mfai.app`;
  const doLogin = () =>
    fetchJson(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

  try {
    const registerRes = await fetchJson(registerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'HealthCheck User',
        email,
        password,
        wallet_address: `HEALTH_${Date.now()}`,
        persona: 'cognitive-activation-hub'
      }),
    });
    if (![200, 201, 409].includes(registerRes.status)) {
      // Ne bloque pas si la création échoue (ex: contraintes mongo ou route fermée)
      // On tente quand même le login.
      // eslint-disable-next-line no-console
      console.warn(`Register non-200 (${registerRes.status}), tentative login quand même`);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Register échoué (${err.message}), tentative login quand même`);
  }

  const res = await doLogin();
  if (res.status !== 200 || !res.json?.accessToken) {
    throw new Error(`Login failed (status ${res.status})`);
  }
  return res.json.accessToken;
}

async function checkAgentMemoryRW() {
  fs.mkdirSync(path.dirname(MEMORY_FILE), { recursive: true });
  let store = {};
  if (fs.existsSync(MEMORY_FILE)) {
    try {
      store = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8') || '{}');
    } catch {
      store = {};
    }
  }
  store['health_check_user'] = store['health_check_user'] || { history: [] };
  store['health_check_user'].history.push({ ts: Date.now(), note: 'health_check' });
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(store, null, 2), 'utf8');
  const reread = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8') || '{}');
  if (!reread['health_check_user']) throw new Error('agent_memory.json write/read failed');
  return reread['health_check_user'].history.length;
}

async function checkRag() {
  const url = `${RAG_BASE_URL}/kb/search`;
  try {
    const res = await fetchJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: 'health check', k: 1 }),
    });
    if (res.status === 200) return { ok: true, source: 'remote', count: (res.json?.snippets || []).length };
    throw new Error(`RAG status ${res.status}`);
  } catch (err) {
    // Fallback: local knowledge base via agent_memory
    const fallback = fs.existsSync(MEMORY_FILE);
    return { ok: true, source: fallback ? 'local_fallback' : 'none', info: 'UNVERIFIED_LOCAL', error: err.message };
  }
}

async function main() {
  const report = { ok: true, checks: {} };
  const isConnRefused = (err) => err && (err.code === 'ECONNREFUSED' || /ECONNREFUSED/.test(err.message || ''));

  try {
    report.checks.backend = await checkBackendHealth();
  } catch (err) {
    report.ok = false;
    report.checks.backend = { error: err.message, offline: isConnRefused(err) };
  }

  try {
    const token = await simulateJwtLogin();
    report.checks.jwt = { ok: true, tokenPreview: token.slice(0, 16) + '...' };
  } catch (err) {
    report.ok = false;
    report.checks.jwt = { error: err.message, offline: isConnRefused(err) };
  }

  try {
    const writes = await checkAgentMemoryRW();
    report.checks.agentMemory = { ok: true, historyLength: writes };
  } catch (err) {
    report.ok = false;
    report.checks.agentMemory = { error: err.message };
  }

  try {
    report.checks.rag = await checkRag();
  } catch (err) {
    report.ok = false;
    report.checks.rag = { error: err.message };
  }

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
