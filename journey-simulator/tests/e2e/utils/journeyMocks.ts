import type { Page, Route } from '@playwright/test';

export type JourneyMockOptions = {
  personaId?: string | null;
  completedPhases?: number[];
  totalXP?: number;
  tokens?: number;
  nftTitles?: string[];
  artifacts?: Array<{ id: string; title: string }>; // minimal artifacts list
  mockMint?: boolean;
  mintTxSignature?: string;
};

const fulfillJson = async (route: Route, data: unknown, status = 200) => {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(data)
  });
};

export const setupJourneyMocks = async (page: Page, options: JourneyMockOptions = {}) => {
  // If undefined, default to 'cognitive-activation-hub'. If null, keep null.
  const personaId = options.personaId === undefined ? 'cognitive-activation-hub' : options.personaId;

  const stateId = Math.floor(Math.random() * 10000);
  console.log(`[Mock:${stateId}] Setup with personaId: ${personaId}`);

  const progressState = {
    personaId,
    completedPhases: new Set(options.completedPhases ?? []),
    totalXP: options.totalXP ?? 0,
    tokens: options.tokens ?? 0,
    nftTitles: new Set(options.nftTitles ?? []),
  };

  const buildProgressPayload = () => ({
    success: true,
    progress: {
      total_xp: progressState.totalXP,
      persona: progressState.personaId,
      completed_phases: progressState.completedPhases.size,
      current_level: Math.floor(progressState.totalXP / 200),
      token_transactions: { mfai_tokens: progressState.tokens },
      nft_certificates: Array.from(progressState.nftTitles).map((title) => ({ title }))
    }
  });

  // No changes to setupJourneyMocks signature...

  // Removed **/user/profile as it's not a primary auth check on load usually, mostly verifyToken.
  // Unless explicit profile fetch. `api.getUserProfile` isn't used in AuthContext checkAuthStatus, only verifyToken.

  await page.route('**/auth/verify', async (route) => {
    await fulfillJson(route, {
      success: true,
      user: {
        id: 'e2e-user-id',
        name: 'Playwright User',
        email: 'playwright@moneyfactory.ai',
        role: 'user',
        persona: progressState.personaId
      }
    });
  });
  await page.route('**/auth/login', async (route) => {
    await fulfillJson(route, {
      success: true,
      token: 'mock-token-123',
      refreshToken: 'mock-refresh-123',
      user: {
        id: 'e2e-user-id',
        name: 'Playwright User',
        email: 'playwright@moneyfactory.ai',
        role: 'user',
        persona: progressState.personaId
      }
    });
  });
  await page.route('**/user/*', async (route) => {
    const request = route.request();
    console.log(`[Mock] User Request: ${request.method()} ${request.url()}`);
    if (request.method() === 'OPTIONS') {
      await route.fulfill({
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'PUT, POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
      return;
    }

    if (request.method() === 'PUT') {
      // Handles api.updateUserProfile (PUT /user/:id)
      try {
        const body = JSON.parse(request.postData() || '{}');
        if (body?.persona) {
          progressState.personaId = body.persona;
          progressState.completedPhases.clear();
        }
      } catch (e) {
        console.error(`[Mock:${stateId}] PUT Parse Error:`, e);
      }
      await fulfillJson(route, { success: true });
      return;
    }
    // If it's not a PUT, continue to matching other routes
    // But verify we don't block other specific routes if any exist (none so far inside user/* other than progress which has its own handler)
    await route.continue();
  });

  // Mock for Collaterize simulation (Moved out of user handler)
  await page.route('**/simulate/collaterize', async (route) => {
    const method = route.request().method();
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (method === 'OPTIONS') {
      await route.fulfill({
        status: 200,
        headers
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers,
      body: JSON.stringify({
        ok: true,
        simulation: {
          eligibilityScore: 85,
          communityScore: 75,
          riskScore: 0.12,
          notes: ['Strong team', 'Audited code'],
          tier: 'gold',
          accepted: true,
          targetRaiseUSD: 1000000,
          softCapUSD: 500000,
          hardCapUSD: 2000000,
          liquidityUSD: 250000,
          initialPriceUSD: 0.10,
          simulatedLaunchUrl: 'https://collaterize.example/simulation'
        }
      })
    });
  });

  // Combined handler for GET user progress and POST update progress
  await page.route('**/user/*/progress', async (route) => {
    if (route.request().method() === 'GET') {
      const payload = buildProgressPayload();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        body: JSON.stringify(payload)
      });
      return;
    }

    // POST update
    try {
      const body = JSON.parse(route.request().postData() || '{}');
      if (typeof body?.total_xp === 'number') {
        progressState.totalXP = body.total_xp;
      }
      if (typeof body?.completed_phases === 'number') {
        progressState.completedPhases = new Set(
          Array.from({ length: body.completed_phases }, (_, idx) => idx)
        );
      }
    } catch {
      // ignore parsing errors
    }
    await fulfillJson(route, { success: true });
  });

  await page.route('**/user/*/progress/reset', async (route) => {
    progressState.completedPhases.clear();
    progressState.totalXP = 0;
    progressState.tokens = 0;
    progressState.nftTitles.clear();
    await fulfillJson(route, { success: true });
  });

  await page.route('**/demo/state', async (route) => {
    await fulfillJson(route, {
      success: true,
      journey: { id: progressState.personaId },
      progress: {
        total_xp: progressState.totalXP,
        completed_phases: progressState.completedPhases.size,
        token_transactions: { mfai_tokens: progressState.tokens },
        nft_certificates: Array.from(progressState.nftTitles).map((title) => ({ title }))
      }
    });
  });

  await page.route('**/journey/*/phases/*/complete', async (route) => {
    let body: any = {};
    try {
      body = JSON.parse(route.request().postData() || '{}');
      const phaseIndex = (body?.phase_number ?? progressState.completedPhases.size + 1) - 1;
      progressState.completedPhases.add(phaseIndex);
      progressState.totalXP += body?.xp_reward ?? 50;
      progressState.tokens += body?.mfai_reward ?? 5;
      if (body?.nft_reward) {
        progressState.nftTitles.add(body.nft_reward);
      }
    } catch {
      // ignore
    }

    await fulfillJson(route, {
      metadata: {
        persona_id: progressState.personaId,
        journey_track: 'demo',
        phase_id: 'demo-phase',
        language: 'en'
      },
      ui_blocks: [
        {
          kind: 'text_block',
          id: 'mock-phase-complete',
          title: 'Mocked Mission Guidance',
          body_markdown: 'Phase completed successfully in mock.'
        }
      ],
      agent_actions: [],
      next_state: {
        phase_id: 'demo-phase',
        completed_missions: [],
        xp_delta: body?.xp_reward ?? 0
      }
    });
  });

  await page.route('**/journey/*/artifacts', async (route) => {
    await fulfillJson(route, {
      success: true,
      artifacts: (options.artifacts ?? [
        { id: 'artifact-1', title: 'Protocol Blueprint', agent: { name: 'Architect', role: 'System', color: 'text-blue-400' }, type: 'TECHNICAL', thumbnailIcon: 'file-text' },
        { id: 'artifact-2', title: 'Market Readiness Checklist', agent: { name: 'Growth', role: 'Strategy', color: 'text-green-400' }, type: 'STRATEGY', thumbnailIcon: 'file-text' }
      ]).map((artifact) => ({
        ...artifact,
        unlockPhase: 0,
        status: 'unlocked'
      })),
      currentPhase: progressState.completedPhases.size
    });
  });

  // ... (agent-logs, journey/*/step seem OK or need check)
  // journey/*/step is correct in journeyStore (fetch).

  // ...

  // Token balance updates
  await page.route('**/user/*/tokens', async (route) => {
    try {
      const body = JSON.parse(route.request().postData() || '{}');
      if (typeof body?.mfai_tokens === 'number') {
        progressState.tokens = body.mfai_tokens;
      }
    } catch {
      // ignore
    }
    await fulfillJson(route, { success: true });
  });

  await page.route('**/nft/certificate', async (route) => {
    try {
      const body = JSON.parse(route.request().postData() || '{}');
      if (body?.title) {
        progressState.nftTitles.add(body.title);
      }
    } catch {
      // ignore
    }
    await fulfillJson(route, { success: true });
  });

  if (options.mockMint) {
    await setupMintMocks(page, options.mintTxSignature);
  }
};

export const setupMintMocks = async (page: Page, txSignature = 'PLAYWRIGHT_SIG') => {
  await page.route('**/solana/mint/simulate', async (route) => {
    await fulfillJson(route, {
      ok: true,
      sim: {
        ok: true,
        estFeeLamports: 4200,
        riskScore: 0.08,
        network: 'devnet'
      }
    });
  });

  await page.route('**/solana/mint/execute', async (route) => {
    await fulfillJson(route, {
      ok: true,
      jobId: 'playwright-job',
      status: 'completed',
      tx: {
        mintAddress: 'PlaywrightMintAddress',
        txSig: txSignature
      }
    });
  });
};

export const seedDemoUser = async (page: Page, personaId: string | null = 'cognitive-activation-hub', progressOverride: any = {}) => {
  await page.addInitScript(({ persona, progress }) => {
    localStorage.setItem('accessToken', 'demo-token');
    localStorage.setItem('refreshToken', 'demo-refresh-token');
    localStorage.setItem('userId', 'demo-user-id');

    const persisted = {
      state: {
        selectedPersona: null, // Force hydration from userProgress to ensure full persona object (phases, etc.)
        userProgress: {
          totalXP: 0,
          nfts: [],
          mfaiTokens: 0,
          completedPhases: [],
          walletConnected: false,
          passLevel: 'Free',
          stakedMfai: 0,
          nftMints: [],
          votingPower: 0,
          daoProposals: 0,
          testnetAirdropClaimed: false,
          socialShareCount: 0,
          shareHistory: [],
          currentPersona: persona ?? undefined,
          ...progress // Apply overrides
        }
      },
      version: 0
    };

    localStorage.setItem('mfai-journey-storage', JSON.stringify(persisted));
  }, { persona: personaId, progress: progressOverride });
};
