/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { execa } from 'execa';
import { promises as fs } from 'fs';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';


// INLINED FROM fixtures/test-data.ts to avoid Vitest collision
const TEST_USERS = {
  demo: {
    email: 'test@mfai.app',
    password: 'MFAITest2026!',
    id: 'demo-user-id',
  },
  real: {
    email: 'real@mfai.app',
    password: 'realpassword123',
    id: 'real-user-id',
  },
} as const;

/**
 * Global Setup - Real Backend Authentication
 * Creates actual backend session with cookies + localStorage
 */
async function globalSetup(config: FullConfig) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const workspaceRoot = path.resolve(__dirname, '..');
  const projectRoot = path.resolve(__dirname, '.');
  const storagePath = path.resolve(projectRoot, 'test-results/.auth/user.json');
  const backendURL = process.env.BACKEND_URL || 'http://127.0.0.1:3002';
  let mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    try {
      const backendEnvPath = path.resolve(workspaceRoot, 'mf-back/.env');
      const envFile = readFileSync(backendEnvPath, 'utf-8');
      for (const rawLine of envFile.split('\n')) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const [key, ...valueParts] = line.split('=');
        if (key === 'MONGO_URI') {
          mongoUri = valueParts.join('=').trim();
          break;
        }
      }
    } catch (envError) {
      console.warn('⚠️  Unable to load mf-back/.env for MONGO_URI, falling back to default', envError);
    }
  }
  if (!mongoUri) {
    mongoUri = 'mongodb://127.0.0.1:27018/mfai_test';
  }
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🔐 Global Setup: seeding + authentification prod-like...');

  try {
    console.log('   ⏳ Seeding user via modèle (hash unique)...');
    await execa('node', ['mf-back/scripts/seed-test-user.js'], {
      cwd: workspaceRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        MONGO_URI: mongoUri,
      }
    });

    console.log(`   🔗 Auth vers ${backendURL}/auth/login`);
    const response = await page.request.post(`${backendURL}/auth/login`, {
      data: {
        email: TEST_USERS.demo.email,
        password: TEST_USERS.demo.password,
      },
    });

    if (!response.ok()) {
      throw new Error(`Backend auth failed: ${response.status()} ${await response.text()}`);
    }

    const authData = await response.json();
    console.log(`   ✅ Backend authenticated: ${authData.user?.email || TEST_USERS.demo.email}`);

    // Aller sur l’app pour initialiser le storage
    await page.goto(`${baseURL}`, { waitUntil: 'networkidle', timeout: 30000 });

    // Injecter le token dans le localStorage
    if (authData?.token) {
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('mfai_token', token); // Keep for legacy
        localStorage.setItem('mfai-run-mode', 'real');
      }, authData.token);
    }

    // Sauvegarder l’état complet
    await fs.mkdir(path.dirname(storagePath), { recursive: true });
    await context.storageState({ path: storagePath });
    console.log(`   ✅ StorageState sauvegardé: ${storagePath}`);

    // Guard: ensure the saved storage state is in real mode and token available
    const storageState = JSON.parse(readFileSync(storagePath, 'utf-8'));
    const originState = storageState.origins?.find((o: any) => /127\.0\.0\.1|localhost/.test(o.origin));
    const runMode = originState?.localStorage?.find((entry: any) => entry.name === 'mfai-run-mode')?.value;
    const storedToken = originState?.localStorage?.find((entry: any) => entry.name === 'accessToken')?.value;
    if (runMode !== 'real') {
      throw new Error(`RUN_MODE_GUARD_FAILED: expected "real" got "${runMode}"`);
    }
    if (!storedToken) {
      throw new Error('AUTH_GUARD_FAILED: missing accessToken in storageState');
    }
    console.log('   🛡️ RUN_MODE_GUARD=real');
    console.log('   🔑 AUTH_STATE=loaded');
    console.log(`AUTH_STATE_PATH=${storagePath}`);
    console.log('AUTH_STATE_EXISTS=true');

    // Write sanitized proof artefact for audit trail
    const proofPath = path.resolve(workspaceRoot, 'artifacts/e2e-auth-proof.json');
    const hashedEmail = createHash('sha256').update(TEST_USERS.demo.email).digest('hex').slice(0, 12);
    const createdAt = new Date().toISOString();
    const projectNames = config.projects
      .map(project => project.name)
      .filter((name): name is string => typeof name === 'string' && name.length > 0);
    const proofPayload = {
      project: 'journey-simulator',
      projects: projectNames,
      createdAt,
      timestamp: createdAt,
      backendBaseUrl: backendURL,
      backendLoginEndpoint: `${backendURL}/auth/login`,
      authStatePath: path.relative(workspaceRoot, storagePath),
      exists: true,
      authStateExists: true,
      runModeGuard: runMode,
      auth_ok: true,
      user_handle: `hash:${hashedEmail}`,
    };
    await fs.mkdir(path.dirname(proofPath), { recursive: true });
    await fs.writeFile(proofPath, JSON.stringify(proofPayload, null, 2));
    console.log(`   🧾 Auth proof écrit: ${proofPath}`);
  } catch (error) {
    console.error('❌ Global Setup: échec auth', error);
    await page.screenshot({ path: path.resolve(__dirname, 'test-results/global-setup-failure.png') });
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
