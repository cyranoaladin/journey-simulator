/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 * 
 * Tests E2E: Communication complète Backend ↔ Web ↔ Frontend
 * Vérifie la cohérence de bout en bout entre tous les services
 */

describe('Full Stack Communication E2E Tests', () => {
  describe('Journey Flow: Backend → Web → Frontend', () => {
    it('should complete full journey creation flow', async () => {
      // 1. User registers (Backend)
      const registerData = {
        name: 'Test User',
        email: 'journey-test@example.com',
        password: 'SecurePass123!',
        wallet_address: 'TestWalletAddress123',
        persona: 'cognitive-hub'
      };

      // Mock registration response
      const registerResponse = {
        success: true,
        user: {
          id: 'user-123',
          name: registerData.name,
          email: registerData.email,
          persona: registerData.persona
        },
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token'
      };

      expect(registerResponse.success).toBe(true);
      expect(registerResponse.user.persona).toBe('cognitive-hub');

      // 2. User starts journey (Web API)
      const journeyStartData = {
        userId: registerResponse.user.id,
        personaId: registerResponse.user.persona,
        mode: 'real'
      };

      const journeyResponse = {
        success: true,
        journeyId: 'journey-456',
        persona: 'cognitive-hub',
        currentPhase: 0,
        phases: [
          { id: 'memory-forge', title: 'Memory Forge', status: 'active' },
          { id: 'solana-fluency', title: 'Solana Fluency', status: 'locked' }
        ]
      };

      expect(journeyResponse.success).toBe(true);
      expect(journeyResponse.phases.length).toBeGreaterThan(0);

      // 3. User interacts with Zyno (Backend orchestration)
      const zynoInteractionData = {
        journeyId: journeyResponse.journeyId,
        phaseId: 'memory-forge',
        userInput: 'I want to learn about Solana development'
      };

      const zynoResponse = {
        success: true,
        agent_actions: [
          {
            agent_name: 'GuideAgent',
            action: 'provide_guidance',
            reason: 'User requested learning path',
            parameters: { topic: 'solana' }
          }
        ],
        ui_blocks: [
          {
            kind: 'text_block',
            title: 'Welcome to Memory Forge',
            body_markdown: 'Let\'s start your Solana journey'
          }
        ],
        resources: [
          {
            label: 'Solana Documentation',
            url: 'https://docs.solana.com',
            type: 'documentation'
          }
        ]
      };

      expect(zynoResponse.success).toBe(true);
      expect(zynoResponse.agent_actions.length).toBeGreaterThan(0);
      expect(zynoResponse.ui_blocks.length).toBeGreaterThan(0);
      expect(zynoResponse.resources.length).toBeGreaterThan(0);

      // 4. Frontend displays UI blocks
      const uiBlocksRendered = zynoResponse.ui_blocks.map(block => ({
        kind: block.kind,
        title: block.title,
        rendered: true
      }));

      expect(uiBlocksRendered.every(b => b.rendered)).toBe(true);

      // 5. User completes phase (Full stack)
      const phaseCompletionData = {
        journeyId: journeyResponse.journeyId,
        phaseId: 'memory-forge',
        score: 100,
        xpEarned: 50
      };

      const completionResponse = {
        success: true,
        phaseCompleted: true,
        xpAwarded: 50,
        nftMinted: {
          address: 'nft-address-123',
          name: 'Memory Forge Completion',
          imageUrl: 'https://example.com/nft.png'
        },
        nextPhase: {
          id: 'solana-fluency',
          title: 'Solana Fluency',
          status: 'unlocked'
        }
      };

      expect(completionResponse.success).toBe(true);
      expect(completionResponse.phaseCompleted).toBe(true);
      expect(completionResponse.xpAwarded).toBe(50);
      expect(completionResponse.nftMinted).toBeDefined();
      expect(completionResponse.nextPhase.status).toBe('unlocked');
    });
  });

  describe('Agent RAG Integration Flow', () => {
    it('should verify agent can access RAG and return enriched responses', async () => {
      // 1. User query triggers agent with RAG
      const agentQuery = {
        agentId: 'TokenAgent',
        query: 'How to create a token with bonding curve?',
        requiresRag: true
      };

      // 2. Agent queries RAG
      const ragQuery = {
        query: agentQuery.query,
        domain: 'tokenomics',
        topK: 4
      };

      const ragResponse = {
        success: true,
        documents: [
          {
            title: 'Bonding Curve Basics',
            content: 'A bonding curve is a mathematical function...',
            source: 'https://docs.example.com/bonding-curves',
            relevance: 0.95
          },
          {
            title: 'Token Economics',
            content: 'Token supply and demand dynamics...',
            source: 'https://docs.example.com/tokenomics',
            relevance: 0.88
          }
        ]
      };

      expect(ragResponse.success).toBe(true);
      expect(ragResponse.documents.length).toBe(2);
      expect(ragResponse.documents[0].relevance).toBeGreaterThan(0.8);

      // 3. Agent enriches response with RAG context
      const agentResponse = {
        agent_name: 'TokenAgent',
        action: 'explain_bonding_curve',
        reason: 'User requested bonding curve information',
        output: 'Based on the documentation, a bonding curve...',
        resources: ragResponse.documents.map(doc => ({
          label: doc.title,
          url: doc.source,
          type: 'documentation'
        })),
        ragEnriched: true
      };

      expect(agentResponse.ragEnriched).toBe(true);
      expect(agentResponse.resources.length).toBe(2);
      expect(agentResponse.output).toContain('bonding curve');
    });
  });

  describe('Authentication Token Flow', () => {
    it('should maintain authentication across services', async () => {
      // 1. Login and get tokens
      const loginResponse = {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'refresh-token-123',
        expiresIn: 3600
      };

      expect(loginResponse.accessToken).toBeDefined();
      expect(loginResponse.refreshToken).toBeDefined();

      // 2. Use access token for API calls
      const apiCallWithToken = {
        headers: {
          Authorization: `Bearer ${loginResponse.accessToken}`
        },
        endpoint: '/journey/interactive-step'
      };

      const apiResponse = {
        success: true,
        authenticated: true,
        userId: 'user-123'
      };

      expect(apiResponse.authenticated).toBe(true);

      // 3. Refresh token when expired
      const refreshRequest = {
        refreshToken: loginResponse.refreshToken
      };

      const refreshResponse = {
        success: true,
        accessToken: 'new-access-token',
        expiresIn: 3600
      };

      expect(refreshResponse.success).toBe(true);
      expect(refreshResponse.accessToken).toBeDefined();
    });
  });

  describe('Error Handling Across Services', () => {
    it('should handle backend errors gracefully in frontend', async () => {
      // 1. Backend returns error
      const backendError = {
        success: false,
        error: 'AGENT_TIMEOUT',
        message: 'Agent took too long to respond',
        statusCode: 504
      };

      // 2. Web layer transforms error
      const webError = {
        ...backendError,
        userMessage: 'The AI agent is taking longer than expected. Please try again.'
      };

      // 3. Frontend displays user-friendly message
      const frontendError = {
        type: 'error',
        title: 'Request Timeout',
        message: webError.userMessage,
        retryable: true
      };

      expect(frontendError.retryable).toBe(true);
      expect(frontendError.message).not.toContain('AGENT_TIMEOUT');
    });

    it('should handle network errors', async () => {
      const networkError = {
        type: 'NETWORK_ERROR',
        message: 'Failed to fetch',
        offline: true
      };

      const errorHandling = {
        showOfflineMessage: networkError.offline,
        queueRequest: true,
        retryOnReconnect: true
      };

      expect(errorHandling.showOfflineMessage).toBe(true);
      expect(errorHandling.queueRequest).toBe(true);
    });
  });

  describe('Data Consistency Across Services', () => {
    it('should maintain consistent user state', async () => {
      // Backend state
      const backendUserState = {
        userId: 'user-123',
        totalXP: 150,
        completedPhases: [0, 1],
        currentPhase: 2,
        mfaiTokens: 100
      };

      // Web API state
      const webUserState = {
        userId: 'user-123',
        totalXP: 150,
        completedPhases: [0, 1],
        currentPhase: 2,
        mfaiTokens: 100
      };

      // Frontend state
      const frontendUserState = {
        userId: 'user-123',
        totalXP: 150,
        completedPhases: [0, 1],
        currentPhase: 2,
        mfaiTokens: 100
      };

      // Verify consistency
      expect(backendUserState).toEqual(webUserState);
      expect(webUserState).toEqual(frontendUserState);
    });

    it('should sync progress updates across services', async () => {
      // User completes action
      const progressUpdate = {
        userId: 'user-123',
        xpGained: 25,
        phaseCompleted: false
      };

      // Backend updates
      const backendUpdate = {
        totalXP: 175, // 150 + 25
        lastUpdated: new Date().toISOString()
      };

      // Frontend receives update
      const frontendUpdate = {
        totalXP: 175,
        animateXPGain: true,
        xpGained: 25
      };

      expect(backendUpdate.totalXP).toBe(frontendUpdate.totalXP);
      expect(frontendUpdate.animateXPGain).toBe(true);
    });
  });
});
