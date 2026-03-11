/**
 * Project: Money Factory AI (MFAI)
 * Neural Nexus Controller - RAG API Endpoints
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA
 */

import { Request, Response } from 'express';
import {
  retrieveContext,
  processAgentQuery,
  logRagInteraction,
} from '../services/neuralNexusService';
import { prisma } from '../config/database';

export class NeuralNexusController {
  /**
   * POST /neural-nexus/search
   * Search knowledge base with semantic similarity
   */
  static async searchContext(req: Request, res: Response): Promise<void> {
    try {
      const { query, limit = 5 } = req.body;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Query parameter required',
        });
        return;
      }

      const context = await retrieveContext(query, limit);

      res.status(200).json({
        success: true,
        query,
        results: context.map(chunk => ({
          id: chunk.id,
          title: chunk.metadata.title,
          content: chunk.content.substring(0, 300) + '...',
          score: chunk.score,
          metadata: chunk.metadata,
        })),
        count: context.length,
      });
    } catch (error) {
      console.error('[Neural Nexus] Search error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * POST /neural-nexus/query
   * Process agent query with RAG augmentation
   */
  static async queryAgent(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { query, agentId, journeyId, minConfidence } = req.body;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Query parameter required',
        });
        return;
      }

      const result = await processAgentQuery(query, {
        agentId,
        minConfidence,
      });

      // Log the interaction if journeyId provided
      if (journeyId && agentId) {
        await logRagInteraction(journeyId, agentId, query, result);
      }

      res.status(200).json({
        success: true,
        query,
        prompt: result.promptUsed,
        source: result.source,
        confidence: result.confidenceScore,
        status: result.status,
        contextChunks: result.context?.length || 0,
      });
    } catch (error) {
      console.error('[Neural Nexus] Query error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * GET /neural-nexus/logs
   * Retrieve RAG interaction logs
   */
  static async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const { journeyId, agentId, limit = 20 } = req.query;

      const logs = await prisma.agentLog.findMany({
        where: {
          ...(journeyId && { journeyId: journeyId as string }),
          ...(agentId && { agent: agentId as string }),
          action: 'rag_query',
        },
        orderBy: { ts: 'desc' },
        take: Number(limit),
      });

      res.status(200).json({
        success: true,
        logs: logs.map(log => ({
          id: log.id,
          journeyId: log.journeyId,
          agent: log.agent,
          timestamp: log.ts,
          details: log.details,
          status: log.status,
        })),
        count: logs.length,
      });
    } catch (error) {
      console.error('[Neural Nexus] Logs retrieval error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * POST /neural-nexus/seed
   * Seed knowledge base with sample documents (dev only)
   */
  static async seedKnowledgeBase(req: Request, res: Response): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'production') {
        res.status(403).json({
          success: false,
          message: 'Seeding disabled in production',
        });
        return;
      }

      const sampleDocs = [
        {
          title: 'Solana DeFi Liquidity Optimization',
          content: 'Comment optimiser la liquidité sur Solana : Utilisez des pools AMM (Automated Market Maker) comme Raydium ou Orca. Configurez des stratégies de yield farming avec des tokens LP. Surveillez les impermanent losses. MFAI propose des agents autonomes pour analyser les opportunités DeFi.',
          category: 'defi',
          tags: ['solana', 'defi', 'liquidity', 'amm'],
        },
        {
          title: 'MFAI Security Audit Framework',
          content: 'MFAI utilise des agents autonomes pour l\'audit de sécurité des smart contracts. Le framework inclut : analyse statique du code, détection de vulnérabilités courantes (reentrancy, overflow), tests de fuzzing, vérification formelle. Les agents génèrent des rapports détaillés avec recommandations.',
          category: 'security',
          tags: ['mfai', 'security', 'audit', 'agents'],
        },
        {
          title: 'NFT Minting on Solana',
          content: 'Guide pour créer des NFTs sur Solana avec Metaplex : Préparez vos métadonnées JSON, utilisez Candy Machine v3 pour le minting, configurez les royalties, déployez sur mainnet-beta. Coût approximatif : 0.01 SOL par NFT.',
          category: 'nft',
          tags: ['solana', 'nft', 'metaplex', 'minting'],
        },
        {
          title: 'Token Economics Design',
          content: 'Les tokenomics MFAI sont conçues pour inciter la participation : 40% allocation communauté, 20% team (vesting 4 ans), 15% liquidity pools, 15% staking rewards, 10% treasury. Modèle déflationniste avec burning sur transactions.',
          category: 'tokenomics',
          tags: ['mfai', 'tokenomics', 'token', 'economics'],
        },
      ];

      const created = [];
      for (const doc of sampleDocs) {
        const existing = await prisma.doc.findFirst({
          where: { title: doc.title },
        });

        if (!existing) {
          const newDoc = await prisma.doc.create({
            data: {
              ...doc,
              embedding: [], // Will be generated on first query
            },
          });
          created.push(newDoc.title);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Knowledge base seeded',
        created: created.length,
        documents: created,
      });
    } catch (error) {
      console.error('[Neural Nexus] Seed error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}
