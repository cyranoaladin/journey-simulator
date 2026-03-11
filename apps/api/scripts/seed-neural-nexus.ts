/**
 * Project: Money Factory AI (MFAI)
 * Neural Nexus - Knowledge Base Seeder
 * Status: Production Ready - 2026
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleDocs = [
  {
    title: 'Solana DeFi Liquidity Optimization',
    content: 'Comment optimiser la liquidité sur Solana : Utilisez des pools AMM (Automated Market Maker) comme Raydium ou Orca. Configurez des stratégies de yield farming avec des tokens LP. Surveillez les impermanent losses. MFAI propose des agents autonomes pour analyser les opportunités DeFi et maximiser les rendements.',
    category: 'defi',
    tags: ['solana', 'defi', 'liquidity', 'amm', 'raydium', 'orca'],
  },
  {
    title: 'MFAI Security Audit Framework',
    content: 'MFAI utilise des agents autonomes pour l\'audit de sécurité des smart contracts. Le framework inclut : analyse statique du code, détection de vulnérabilités courantes (reentrancy, overflow, access control), tests de fuzzing, vérification formelle. Les agents génèrent des rapports détaillés avec recommandations et scores de risque.',
    category: 'security',
    tags: ['mfai', 'security', 'audit', 'agents', 'smart-contracts'],
  },
  {
    title: 'NFT Minting on Solana with Metaplex',
    content: 'Guide pour créer des NFTs sur Solana avec Metaplex : Préparez vos métadonnées JSON conformes au standard, utilisez Candy Machine v3 pour le minting, configurez les royalties (5-10% recommandé), déployez sur mainnet-beta. Coût approximatif : 0.01 SOL par NFT + frais de stockage.',
    category: 'nft',
    tags: ['solana', 'nft', 'metaplex', 'minting', 'candy-machine'],
  },
  {
    title: 'MFAI Token Economics Design',
    content: 'Les tokenomics MFAI sont conçues pour inciter la participation long-terme : 40% allocation communauté (airdrops, rewards), 20% team (vesting 4 ans), 15% liquidity pools, 15% staking rewards, 10% treasury. Modèle déflationniste avec burning de 2% sur chaque transaction. Supply totale : 1 milliard de tokens.',
    category: 'tokenomics',
    tags: ['mfai', 'tokenomics', 'token', 'economics', 'vesting'],
  },
  {
    title: 'Real Mode Journey System Architecture',
    content: 'Le système Real Mode de MFAI permet aux utilisateurs de progresser à travers 6 personas (Cognitive Activation Hub, Capital Foundry, System Architect, Experience Studio, Impact Engine, Resilience Master). Chaque persona a 6 phases avec des missions spécifiques. Progression trackée via JourneyProgress avec XP, MFAI tokens, NFT certificates et pass levels.',
    category: 'journey',
    tags: ['mfai', 'journey', 'real-mode', 'personas', 'progression'],
  },
  {
    title: 'RAG (Retrieval-Augmented Generation) Best Practices',
    content: 'Pour implémenter un RAG efficace : 1) Utilisez des embeddings de qualité (OpenAI text-embedding-3, Voyage AI), 2) Optimisez le chunking (300-500 tokens par chunk), 3) Implémentez une recherche par similarité cosinus, 4) Utilisez pgvector pour PostgreSQL, 5) Mesurez la pertinence avec des scores de confiance, 6) Loggez toutes les interactions pour l\'observabilité.',
    category: 'ai',
    tags: ['rag', 'ai', 'embeddings', 'vector-search', 'neural-nexus'],
  },
];

async function seedNeuralNexus() {
  console.log('🧠 Neural Nexus - Seeding Knowledge Base...\n');
  
  try {
    let created = 0;
    let skipped = 0;
    
    for (const doc of sampleDocs) {
      const existing = await prisma.doc.findFirst({
        where: { title: doc.title },
      });
      
      if (!existing) {
        await prisma.doc.create({
          data: {
            ...doc,
            embedding: [], // Will be generated on first retrieval
          },
        });
        console.log(`  ✅ Created: ${doc.title}`);
        created++;
      } else {
        console.log(`  ⏭️  Skipped: ${doc.title} (already exists)`);
        skipped++;
      }
    }
    
    console.log(`\n✅ Seeding complete: ${created} created, ${skipped} skipped`);
    console.log(`📊 Total documents in knowledge base: ${await prisma.doc.count()}\n`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedNeuralNexus();
