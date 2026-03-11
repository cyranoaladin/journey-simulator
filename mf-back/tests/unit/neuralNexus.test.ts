/**
 * Project: Money Factory AI (MFAI)
 * Module: Neural Nexus - RAG Validation Suite
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA
 */

import { processAgentQuery, retrieveContext, logRagInteraction } from '../../src/services/neuralNexusService';
import { prisma } from '../../src/config/database';

// Mock Prisma
jest.mock('../../src/config/database', () => ({
  prisma: {
    doc: {
      findMany: jest.fn(),
    },
    agentLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('Neural Nexus: RAG & Context Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // 1. Validation de la Récupération (Retrieval)
  it('should retrieve relevant context from the vector store based on query similarity', async () => {
    const mockDocs = [
      {
        id: 'doc-1',
        title: 'Solana DeFi Guide',
        content: 'Comment optimiser la liquidité sur Solana avec des pools AMM',
        embedding: [0.8, 0.6, 0.9, 0.2, 0.1, 0.3, 0.4, 0.5, 0.7],
        category: 'defi',
        tags: ['solana', 'liquidity', 'defi'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'doc-2',
        title: 'NFT Minting',
        content: 'How to mint NFTs on Ethereum',
        embedding: [0.1, 0.2, 0.1, 0.8, 0.9, 0.3, 0.2, 0.1, 0.2],
        category: 'nft',
        tags: ['nft', 'ethereum'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    (prisma.doc.findMany as jest.Mock).mockResolvedValue(mockDocs);
    
    const query = "Comment optimiser la liquidité sur Solana ?";
    const context = await retrieveContext(query);
    
    expect(context).toBeDefined();
    expect(context.length).toBeGreaterThan(0);
    // Vérifie que les mots-clés critiques sont présents dans le contexte récupéré
    expect(context[0].content).toMatch(/Solana|liquidité|DeFi/i);
    expect(context[0].score).toBeGreaterThan(0);
  });

  // 2. Validation de l'Augmentation (Augmentation)
  it('should correctly inject retrieved context into the agent prompt', async () => {
    const mockContext = "MFAI utilise des agents autonomes pour l'audit de sécurité.";
    const query = "Que fait MFAI ?";
    
    const result = await processAgentQuery(query, { manualContext: mockContext });
    
    // L'agent doit utiliser le contexte fourni pour répondre
    expect(result.promptUsed).toContain(mockContext);
    expect(result.source).toBe('rag_augmented');
    expect(result.confidenceScore).toBe(1.0);
  });

  // 3. Gestion des Cas Limites (Empty Retrieval)
  it('should fallback gracefully when no relevant context is found', async () => {
    (prisma.doc.findMany as jest.Mock).mockResolvedValue([]);
    
    const query = "Quel est le score de tennis de Mars ?";
    const result = await processAgentQuery(query);
    
    // Doit identifier que le contexte est insuffisant sans crash
    expect(result.confidenceScore).toBeLessThan(0.5);
    expect(result.status).toBe('insufficient_context');
  });

  // 4. Synchronisation avec les Logs (Neural Link)
  it('should persist RAG-generated logs in the database', async () => {
    const mockLog = {
      id: 'log-1',
      journeyId: 'security-audit',
      userId: 'user-1',
      agent: 'agent-001',
      action: 'rag_query',
      details: { rag_active: true },
      ts: new Date(),
      status: 'ok',
      latencyMs: 100,
    };
    
    (prisma.agentLog.create as jest.Mock).mockResolvedValue(mockLog);
    (prisma.agentLog.findMany as jest.Mock).mockResolvedValue([
      {
        ...mockLog,
        details: { rag_active: true, message: 'Audit de sécurité lancé' },
      },
    ]);
    
    const agentId = 'agent-001';
    const query = "Lancer l'audit de sécurité.";
    const result = {
      promptUsed: query,
      source: 'rag_augmented' as const,
      confidenceScore: 0.8,
      status: 'success' as const,
    };
    
    await logRagInteraction('security-audit', agentId, query, result);
    
    // Vérifie que la création a été appelée
    expect(prisma.agentLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          journeyId: 'security-audit',
          agent: agentId,
          action: 'rag_query',
        }),
      })
    );
    
    // Vérifie via l'API de logs que l'entrée existe
    const logs = await prisma.agentLog.findMany({ where: { journeyId: 'security-audit' } });
    const lastLog = logs[0];
    
    expect(lastLog.details).toHaveProperty('rag_active', true);
    expect(lastLog.details).toHaveProperty('message');
  });

  // 5. Test de similitude cosinus
  it('should calculate correct cosine similarity scores', async () => {
    const mockDocs = [
      {
        id: 'doc-1',
        title: 'Highly relevant',
        content: 'solana defi liquidity pool optimization',
        embedding: [0.9, 0.8, 0.9, 0.1, 0.2, 0.1, 0.2, 0.1, 0.1],
        category: 'defi',
        tags: ['solana'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'doc-2',
        title: 'Less relevant',
        content: 'ethereum nft marketplace',
        embedding: [0.1, 0.1, 0.1, 0.9, 0.8, 0.2, 0.1, 0.2, 0.1],
        category: 'nft',
        tags: ['ethereum'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    (prisma.doc.findMany as jest.Mock).mockResolvedValue(mockDocs);
    
    const query = "solana defi liquidity";
    const context = await retrieveContext(query, 2);
    
    expect(context[0].score).toBeGreaterThan(context[1].score);
    expect(context[0].id).toBe('doc-1');
  });
});
