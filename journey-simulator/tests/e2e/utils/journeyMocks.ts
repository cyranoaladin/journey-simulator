import type { Page, Route } from '@playwright/test';

export type JourneyMockOptions = {
  personaId?: string;
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
  const personaId = options.personaId ?? 'cognitive-activation-hub';
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

  await page.route('**/user/profile', async (route) => {
    await fulfillJson(route, {
      success: true,
      user: {
        id: 'e2e-user-id',
        name: 'Playwright User',
        email: 'playwright@moneyfactory.ai',
        role: 'user',
        persona: personaId
      }
    });
  });

  await page.route('**/user/verify', async (route) => {
    await fulfillJson(route, {
      success: true,
      user: {
        id: 'e2e-user-id',
        name: 'Playwright User',
        email: 'playwright@moneyfactory.ai',
        role: 'user',
        persona: personaId
      }
    });
  });

  await page.route('**/user/update-profile', async (route) => {
    try {
      const body = JSON.parse(route.request().postData() || '{}');
      if (body?.persona) {
        progressState.personaId = body.persona;
      }
    } catch {
      // ignore
    }
    await fulfillJson(route, { success: true });
  });

  await page.route('**/journey/user-progress', async (route) => {
    if (route.request().method() === 'GET') {
      await fulfillJson(route, buildProgressPayload());
      return;
    }

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

  await page.route('**/journey/reset-progress', async (route) => {
    progressState.completedPhases.clear();
    progressState.totalXP = 0;
    progressState.tokens = 0;
    progressState.nftTitles.clear();
    await fulfillJson(route, { success: true });
  });

  await page.route('**/journey/load-demo', async (route) => {
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

  await page.route('**/journey/complete-phase', async (route) => {
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

  await page.route('**/journey/artifacts', async (route) => {
    await fulfillJson(route, {
      success: true,
      artifacts: (options.artifacts ?? [
        { id: 'artifact-1', title: 'Protocol Blueprint' },
        { id: 'artifact-2', title: 'Market Readiness Checklist' }
      ]).map((artifact) => ({
        ...artifact,
        unlockPhase: 0,
        status: 'unlocked'
      })),
      currentPhase: progressState.completedPhases.size
    });
  });

  await page.route('**/admin/agent-logs*', async (route) => {
    await fulfillJson(route, [
      {
        userId: 'e2e-user-id',
        agentName: 'Zyno Orchestrator',
        ae_summary: 'Mocked agent log entry.',
        ae_outcome: 'success',
        timestamp: new Date().toISOString()
      }
    ]);
  });

  await page.route('**/journey/*/step', async (route) => {
    await fulfillJson(route, {
      metadata: {
        persona_id: progressState.personaId,
        journey_track: 'demo',
        phase_id: `phase-${progressState.completedPhases.size}`,
        language: 'en'
      },
      ui_blocks: [
        {
          kind: 'text_block',
          id: 'mock-step-guidance',
          title: 'Mocked Mission Guidance',
          body_markdown: 'This response is generated by the Playwright mock layer to unblock UI rendering.'
        }
      ],
      agent_actions: [],
      next_state: {
        phase_id: `phase-${progressState.completedPhases.size}`,
        completed_missions: [],
        xp_delta: 0
      }
    });
  });

  await page.route('**/journey/submit', async (route) => {
    await fulfillJson(route, {
      metadata: {
        persona_id: progressState.personaId,
        journey_track: 'demo',
        phase_id: `phase-${progressState.completedPhases.size}`,
        language: 'en'
      },
      ui_blocks: [
        {
          kind: 'text_block',
          id: 'mock-submit',
          title: 'Submission Received',
          body_markdown: 'Submission accepted via mock route.'
        }
      ],
      agent_actions: [],
      next_state: {
        phase_id: `phase-${progressState.completedPhases.size}`,
        completed_missions: [],
        xp_delta: 0
      }
    });
  });

  // Token balance updates
  await page.route('**/user/tokens', async (route) => {
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

  await page.route('**/user/nft-certificates', async (route) => {
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

export const seedDemoUser = async (page: Page, personaId: string | null = 'cognitive-activation-hub') => {
  await page.addInitScript((persona) => {
    localStorage.setItem('accessToken', 'demo-token');
    localStorage.setItem('refreshToken', 'demo-refresh-token');
    localStorage.setItem('userId', 'demo-user-id');

    const persisted = {
      state: {
        selectedPersona: persona
          ? { id: persona, title: persona }
          : null,
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
        }
      },
      version: 0
    };

    localStorage.setItem('mfai-journey-storage', JSON.stringify(persisted));
  }, personaId);
};
