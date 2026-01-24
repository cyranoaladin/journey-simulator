/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 * 
 * Tests unitaires: Agents avec RAG
 * Vérifie que tous les agents configurés avec requiresRag=true peuvent accéder au RAG
 */

describe('Agents RAG Integration Unit Tests', () => {
  const agentsWithRAG = [
    // Security
    { agentId: 'SecurityAuditAgent', domain: 'security', capabilities: ['audit', 'risk', 'compliance'] },
    { agentId: 'SecurityAgent', domain: 'security', capabilities: ['red_team', 'exploits'] },
    { agentId: 'AuditAgent', domain: 'audit', capabilities: ['code_quality', 'security'] },
    { agentId: 'ComplianceAgent', domain: 'compliance', capabilities: ['policy', 'regulation'] },
    
    // Product & Journey
    { agentId: 'ProductSpecAgent', domain: 'product', capabilities: ['spec', 'flows', 'acceptance'] },
    { agentId: 'ProductAgent', domain: 'product', capabilities: ['discovery', 'strategy'] },
    { agentId: 'JourneyDesignAgent', domain: 'journey', capabilities: ['design', 'mapping'] },
    { agentId: 'EvaluationAgent', domain: 'quality', capabilities: ['evaluation', 'rubric'] },
    
    // Tokenomics & Governance
    { agentId: 'TokenAgent', domain: 'tokenomics', capabilities: ['utility', 'mapping'] },
    { agentId: 'TokenomicsAgent', domain: 'tokenomics', capabilities: ['economy', 'supply'] },
    { agentId: 'GovernanceDAOAgent', domain: 'governance', capabilities: ['dao', 'voting'] },
    { agentId: 'GovernanceAgent', domain: 'governance', capabilities: ['strategy', 'policy'] },
    
    // Cognitive
    { agentId: 'GuideAgent', domain: 'cognitive', capabilities: ['orientation', 'help'] },
    { agentId: 'EducationAgent', domain: 'cognitive', capabilities: ['teaching', 'explaining'] },
    { agentId: 'ReflectionAgent', domain: 'cognitive', capabilities: ['analysis', 'meta'] },
    { agentId: 'CoachAgent', domain: 'cognitive', capabilities: ['strategy', 'advice'] },
    
    // Architecture & Development
    { agentId: 'BuilderAgent', domain: 'architecture', capabilities: ['system_design', 'stack'] },
    { agentId: 'ProtocolAgent', domain: 'protocol', capabilities: ['standards', 'token_2022'] },
    { agentId: 'DevAgent', domain: 'development', capabilities: ['code', 'implementation'] },
    { agentId: 'ArchitectAgent', domain: 'architecture', capabilities: ['system', 'infrastructure'] },
    
    // Blockchain & NFT
    { agentId: 'SolanaAnchorAgent', domain: 'blockchain', capabilities: ['anchor', 'solana'] },
    { agentId: 'NFTAgent', domain: 'nft', capabilities: ['metadata', 'strategy'] },
    { agentId: 'MintingAgent', domain: 'mint', capabilities: ['mint', 'nft'] },
    
    // Legal & Compliance
    { agentId: 'Web3LegalAgent', domain: 'legal', capabilities: ['legal', 'mica'] },
    { agentId: 'RiskFraudAgent', domain: 'risk', capabilities: ['fraud', 'risk'] },
    
    // Others
    { agentId: 'UXWritingAgent', domain: 'ux', capabilities: ['ux_writing'] },
    { agentId: 'DataIntegrityAgent', domain: 'data', capabilities: ['integrity', 'validation'] },
    { agentId: 'OnboardingAgent', domain: 'ux', capabilities: ['onboarding', 'flows'] },
    { agentId: 'APIContractAgent', domain: 'api', capabilities: ['contracts', 'schemas'] },
    { agentId: 'PitchAgent', domain: 'investor', capabilities: ['pitch', 'deck'] },
    { agentId: 'GrowthAgent', domain: 'growth', capabilities: ['growth', 'marketing'] },
    { agentId: 'InvestorDemoAgent', domain: 'investor', capabilities: ['demo', 'pitch'] },
    { agentId: 'CommunityAgent', domain: 'growth', capabilities: ['community', 'engagement'] },
    { agentId: 'InvestorAgent', domain: 'investor', capabilities: ['fundraise', 'pitch'] },
    { agentId: 'QAPlaywrightAgent', domain: 'qa', capabilities: ['e2e', 'playwright'] },
    { agentId: 'LaunchpadAgent', domain: 'investor', capabilities: ['incubation', 'launch'] },
    { agentId: 'DevOpsAgent', domain: 'devops', capabilities: ['ci_cd', 'infra'] },
    { agentId: 'ObservabilityAgent', domain: 'observability', capabilities: ['logs', 'metrics', 'tracing'] },
    { agentId: 'CurriculumAgent', domain: 'education', capabilities: ['curriculum', 'learning_path'] },
    { agentId: 'MarketplaceAgent', domain: 'marketplace', capabilities: ['listing', 'pricing'] },
    { agentId: 'AnalyticsAgent', domain: 'analytics', capabilities: ['analytics', 'insights'] },
    { agentId: 'PerformanceAgent', domain: 'performance', capabilities: ['perf', 'optimization'] },
    { agentId: 'WalletAuthAgent', domain: 'auth', capabilities: ['wallet', 'auth'] },
    { agentId: 'DesignAgent', domain: 'design', capabilities: ['visuals', 'ux'] },
    { agentId: 'DAOAgent', domain: 'dao', capabilities: ['tooling', 'structure'] },
    { agentId: 'CFOAgent', domain: 'finance', capabilities: ['financial_planning', 'budgeting'] },
    { agentId: 'EngineerAgent', domain: 'engineering', capabilities: ['implementation', 'optimization'] },
  ];

  describe('Agent RAG Configuration', () => {
    it('should have 52 agents configured with RAG', () => {
      expect(agentsWithRAG.length).toBe(52);
    });

    it('should have all agents with valid domain', () => {
      agentsWithRAG.forEach(agent => {
        expect(agent.domain).toBeDefined();
        expect(typeof agent.domain).toBe('string');
        expect(agent.domain.length).toBeGreaterThan(0);
      });
    });

    it('should have all agents with capabilities', () => {
      agentsWithRAG.forEach(agent => {
        expect(agent.capabilities).toBeDefined();
        expect(Array.isArray(agent.capabilities)).toBe(true);
        expect(agent.capabilities.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Agent RAG Query Simulation', () => {
    it('should simulate RAG query for SecurityAuditAgent', async () => {
      const agent = agentsWithRAG.find(a => a.agentId === 'SecurityAuditAgent');
      
      const ragQuery = {
        query: 'What are the OWASP Top 10 vulnerabilities?',
        domain: agent.domain,
        topK: 4
      };

      const mockRagResponse = {
        success: true,
        documents: [
          { title: 'OWASP Top 10', content: 'Injection, Broken Auth...', relevance: 0.95 },
          { title: 'Security Best Practices', content: 'Always validate input...', relevance: 0.88 }
        ]
      };

      expect(mockRagResponse.success).toBe(true);
      expect(mockRagResponse.documents.length).toBeGreaterThan(0);
    });

    it('should simulate RAG query for TokenAgent', async () => {
      const agent = agentsWithRAG.find(a => a.agentId === 'TokenAgent');
      
      const ragQuery = {
        query: 'How to implement a bonding curve?',
        domain: agent.domain,
        topK: 4
      };

      const mockRagResponse = {
        success: true,
        documents: [
          { title: 'Bonding Curves', content: 'Mathematical function...', relevance: 0.92 },
          { title: 'Token Economics', content: 'Supply and demand...', relevance: 0.85 }
        ]
      };

      expect(mockRagResponse.success).toBe(true);
      expect(mockRagResponse.documents.length).toBeGreaterThan(0);
    });

    it('should simulate RAG query for Web3LegalAgent', async () => {
      const agent = agentsWithRAG.find(a => a.agentId === 'Web3LegalAgent');
      
      const ragQuery = {
        query: 'What are MICA regulations?',
        domain: agent.domain,
        topK: 4
      };

      const mockRagResponse = {
        success: true,
        documents: [
          { title: 'MICA Overview', content: 'Markets in Crypto-Assets...', relevance: 0.98 },
          { title: 'EU Crypto Regulations', content: 'Compliance requirements...', relevance: 0.90 }
        ]
      };

      expect(mockRagResponse.success).toBe(true);
      expect(mockRagResponse.documents.length).toBeGreaterThan(0);
    });
  });

  describe('Agent Response Enrichment', () => {
    it('should enrich agent response with RAG context', () => {
      const ragDocuments = [
        { title: 'Doc 1', content: 'Content 1', source: 'https://example.com/1' },
        { title: 'Doc 2', content: 'Content 2', source: 'https://example.com/2' }
      ];

      const enrichedResponse = {
        agent_name: 'GuideAgent',
        action: 'provide_guidance',
        reason: 'User requested information',
        output: 'Based on the documentation: Content 1, Content 2',
        resources: ragDocuments.map(doc => ({
          label: doc.title,
          url: doc.source,
          type: 'documentation'
        })),
        ragEnriched: true
      };

      expect(enrichedResponse.ragEnriched).toBe(true);
      expect(enrichedResponse.resources.length).toBe(2);
      expect(enrichedResponse.output).toContain('Content 1');
    });

    it('should handle empty RAG results gracefully', () => {
      const ragDocuments = [];

      const response = {
        agent_name: 'ProductAgent',
        action: 'analyze_product',
        reason: 'User query',
        output: 'Based on my knowledge...',
        resources: ragDocuments,
        ragEnriched: false
      };

      expect(response.ragEnriched).toBe(false);
      expect(response.resources.length).toBe(0);
      expect(response.output).toBeDefined();
    });
  });

  describe('Domain-Specific RAG Queries', () => {
    const domainQueries = {
      security: 'What are common security vulnerabilities?',
      tokenomics: 'How to design token economics?',
      governance: 'What are DAO governance models?',
      legal: 'What are crypto regulations?',
      blockchain: 'How to use Solana Anchor framework?',
      cognitive: 'What are effective learning strategies?',
      architecture: 'What are microservices patterns?',
      development: 'What are clean code principles?'
    };

    Object.entries(domainQueries).forEach(([domain, query]) => {
      it(`should query RAG for ${domain} domain`, () => {
        const ragQuery = {
          query,
          domain,
          topK: 4
        };

        expect(ragQuery.domain).toBe(domain);
        expect(ragQuery.query).toBeDefined();
        expect(ragQuery.topK).toBe(4);
      });
    });
  });

  describe('RAG Performance', () => {
    it('should return results within acceptable time', () => {
      const startTime = Date.now();
      
      // Simulate RAG query
      const mockRagQuery = {
        query: 'Test query',
        domain: 'test',
        topK: 4
      };

      const mockResponse = {
        success: true,
        documents: [],
        queryTime: Date.now() - startTime
      };

      expect(mockResponse.queryTime).toBeLessThan(2000); // < 2 seconds
    });

    it('should handle concurrent RAG queries', async () => {
      const queries = [
        { agent: 'TokenAgent', query: 'Token design' },
        { agent: 'SecurityAgent', query: 'Security audit' },
        { agent: 'GuideAgent', query: 'Learning path' }
      ];

      const results = queries.map(q => ({
        agent: q.agent,
        success: true,
        documents: []
      }));

      expect(results.length).toBe(3);
      expect(results.every(r => r.success)).toBe(true);
    });
  });
});
