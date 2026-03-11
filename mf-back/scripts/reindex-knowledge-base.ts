/**
 * MFAI - Knowledge Base Reindexing Script
 * Stack Souveraine: Ollama (nomic-embed-text) + ChromaDB
 * 
 * Fonctionnalités:
 * - Purge de l'ancienne collection (vecteurs OpenAI incompatibles)
 * - Scan récursif du dossier docs/knowledge
 * - Chunking intelligent (1000 chars, overlap 200)
 * - Génération d'embeddings via Ollama local
 * - Indexation dans ChromaDB avec métadonnées
 */

import { ChromaClient, Collection } from 'chromadb';
import { Ollama } from 'ollama';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Configuration
const CHROMA_HOST = process.env.CHROMA_HOST || 'http://localhost:8000';
const CHROMA_COLLECTION = process.env.CHROMA_COLLECTION || 'mfai_knowledge_base';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';
const KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || path.join(__dirname, '../docs/knowledge');

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

interface DocumentChunk {
  id: string;
  text: string;
  metadata: {
    source: string;
    filename: string;
    chunk_index: number;
    total_chunks: number;
    created_at: string;
  };
}

class KnowledgeBaseIndexer {
  private chromaClient: ChromaClient;
  private ollamaClient: Ollama;
  private collection: Collection | null = null;
  private stats = {
    filesProcessed: 0,
    chunksCreated: 0,
    embeddingsGenerated: 0,
    errors: 0,
  };

  constructor() {
    this.chromaClient = new ChromaClient({ path: CHROMA_HOST });
    this.ollamaClient = new Ollama({ host: OLLAMA_HOST });
  }

  async initialize() {
    console.log('🔗 Connexion à ChromaDB...');
    console.log(`   Host: ${CHROMA_HOST}`);
    
    try {
      await this.chromaClient.heartbeat();
      console.log('✅ ChromaDB actif\n');
    } catch (error: any) {
      console.error('❌ ERREUR: ChromaDB inaccessible');
      console.error(`   URL: ${CHROMA_HOST}`);
      console.error(`   Message: ${error.message}`);
      console.error('\n💡 Démarrez ChromaDB avec:');
      console.error('   docker run -p 8000:8000 chromadb/chroma\n');
      throw error;
    }

    console.log('🔗 Connexion à Ollama...');
    console.log(`   Host: ${OLLAMA_HOST}`);
    console.log(`   Modèle: ${EMBEDDING_MODEL}`);
    
    try {
      const models = await this.ollamaClient.list();
      const modelExists = models.models.some((m: any) => m.name === EMBEDDING_MODEL);
      
      if (!modelExists) {
        console.error(`❌ ERREUR: Modèle "${EMBEDDING_MODEL}" non trouvé`);
        console.error('\n💡 Installez le modèle avec:');
        console.error(`   ollama pull ${EMBEDDING_MODEL}\n`);
        throw new Error(`Model ${EMBEDDING_MODEL} not found`);
      }
      
      console.log('✅ Ollama actif\n');
    } catch (error: any) {
      console.error('❌ ERREUR: Ollama inaccessible');
      console.error(`   URL: ${OLLAMA_HOST}`);
      console.error(`   Message: ${error.message}`);
      console.error('\n💡 Démarrez Ollama avec:');
      console.error('   ollama serve\n');
      throw error;
    }
  }

  async purgeCollection() {
    console.log(`🗑️  Purge de la collection "${CHROMA_COLLECTION}"...`);
    
    try {
      await this.chromaClient.deleteCollection({ name: CHROMA_COLLECTION });
      console.log('✅ Collection supprimée\n');
    } catch (error: any) {
      if (error.message?.includes('does not exist')) {
        console.log('ℹ️  Collection n\'existe pas (première indexation)\n');
      } else {
        console.warn('⚠️  Erreur lors de la suppression:', error.message, '\n');
      }
    }
  }

  async createCollection() {
    console.log(`🔨 Création de la collection "${CHROMA_COLLECTION}"...`);
    
    try {
      this.collection = await this.chromaClient.createCollection({
        name: CHROMA_COLLECTION,
        metadata: {
          description: 'MFAI Neural Nexus Knowledge Base',
          embedding_model: EMBEDDING_MODEL,
          embedding_dimension: '768',
          distance_metric: 'cosine',
          created_at: new Date().toISOString(),
        },
      });
      
      console.log('✅ Collection créée\n');
    } catch (error: any) {
      console.error('❌ ERREUR lors de la création de la collection:', error.message);
      throw error;
    }
  }

  async scanKnowledgeDirectory(): Promise<string[]> {
    console.log(`📂 Scan du dossier: ${KNOWLEDGE_DIR}\n`);
    
    if (!fs.existsSync(KNOWLEDGE_DIR)) {
      console.warn(`⚠️  Dossier "${KNOWLEDGE_DIR}" introuvable`);
      console.log('   Création du dossier...');
      fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
      
      // Créer un document exemple
      const exampleDoc = `# MFAI - Money Factory AI

## Introduction
MFAI est une plateforme Web3 qui permet aux entrepreneurs de créer des projets blockchain avec l'aide de l'intelligence artificielle.

## Fonctionnalités Principales
- Architecture multi-agents pour le développement Web3
- Génération de smart contracts Solana
- Audit de sécurité automatisé
- Tokenomics et conception d'économie
- Déploiement automatisé sur devnet/mainnet

## Technologies
- Blockchain: Solana (Anchor Framework)
- IA: Ollama (qwen2.5, nomic-embed-text)
- Vector Store: ChromaDB
- Backend: Node.js, TypeScript, PostgreSQL
- Frontend: React, Vite

## Neural Nexus RAG System
Le système Neural Nexus utilise RAG (Retrieval-Augmented Generation) pour fournir des réponses contextuelles aux utilisateurs basées sur une base de connaissances vectorielle locale.
`;
      
      fs.writeFileSync(path.join(KNOWLEDGE_DIR, 'MFAI_Introduction.md'), exampleDoc);
      console.log('✅ Document exemple créé: MFAI_Introduction.md\n');
    }
    
    const files = await this.walkDirectory(KNOWLEDGE_DIR);
    console.log(`✅ ${files.length} fichiers trouvés\n`);
    
    return files;
  }

  private async walkDirectory(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await this.walkDirectory(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.md', '.txt', '.markdown'].includes(ext)) {
          files.push(fullPath);
        }
      }
    }
    
    return files;
  }

  private chunkText(text: string, filename: string): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    let startIndex = 0;
    let chunkIndex = 0;
    
    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + CHUNK_SIZE, text.length);
      const chunkText = text.slice(startIndex, endIndex).trim();
      
      if (chunkText.length > 0) {
        chunks.push({
          id: `${filename}_chunk_${chunkIndex}`,
          text: chunkText,
          metadata: {
            source: filename,
            filename: path.basename(filename),
            chunk_index: chunkIndex,
            total_chunks: 0, // Will be updated after
            created_at: new Date().toISOString(),
          },
        });
        chunkIndex++;
      }
      
      startIndex += CHUNK_SIZE - CHUNK_OVERLAP;
    }
    
    // Update total_chunks
    chunks.forEach(chunk => {
      chunk.metadata.total_chunks = chunks.length;
    });
    
    return chunks;
  }

  async processFile(filePath: string): Promise<DocumentChunk[]> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const chunks = this.chunkText(content, filePath);
      
      this.stats.filesProcessed++;
      this.stats.chunksCreated += chunks.length;
      
      return chunks;
    } catch (error: any) {
      console.error(`   ❌ Erreur lors de la lecture de ${filePath}:`, error.message);
      this.stats.errors++;
      return [];
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.ollamaClient.embeddings({
        model: EMBEDDING_MODEL,
        prompt: text,
      });
      
      this.stats.embeddingsGenerated++;
      return response.embedding;
    } catch (error: any) {
      console.error(`   ❌ Erreur génération embedding:`, error.message);
      this.stats.errors++;
      throw error;
    }
  }

  async indexChunks(chunks: DocumentChunk[], batchSize: number = 10) {
    if (!this.collection) {
      throw new Error('Collection not initialized');
    }
    
    console.log(`   📝 Indexation de ${chunks.length} chunks...`);
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, Math.min(i + batchSize, chunks.length));
      
      try {
        // Générer les embeddings pour le batch
        const embeddings = await Promise.all(
          batch.map(chunk => this.generateEmbedding(chunk.text))
        );
        
        // Préparer les données pour ChromaDB
        const ids = batch.map(chunk => chunk.id);
        const documents = batch.map(chunk => chunk.text);
        const metadatas = batch.map(chunk => chunk.metadata as any);
        
        // Insérer dans ChromaDB
        await this.collection.add({
          ids,
          embeddings,
          documents,
          metadatas,
        });
        
        process.stdout.write(`\r   ⏳ Progression: ${Math.min(i + batchSize, chunks.length)}/${chunks.length} chunks`);
      } catch (error: any) {
        console.error(`\n   ❌ Erreur batch ${i}-${i + batchSize}:`, error.message);
        this.stats.errors++;
      }
    }
    
    console.log('\n   ✅ Indexation terminée\n');
  }

  async run() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     MFAI - Réindexation de la Base de Connaissances      ║');
    console.log('║     Stack Souveraine: Ollama + ChromaDB                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    const startTime = Date.now();
    
    try {
      // 1. Initialisation
      await this.initialize();
      
      // 2. Purge
      await this.purgeCollection();
      
      // 3. Création de la collection
      await this.createCollection();
      
      // 4. Scan des fichiers
      const files = await this.scanKnowledgeDirectory();
      
      if (files.length === 0) {
        console.log('⚠️  Aucun fichier à indexer. Ajoutez des documents dans docs/knowledge/\n');
        return;
      }
      
      // 5. Traitement des fichiers
      console.log('🔄 Traitement des fichiers...\n');
      
      for (const [index, filePath] of files.entries()) {
        const filename = path.basename(filePath);
        console.log(`📄 [${index + 1}/${files.length}] ${filename}`);
        
        const chunks = await this.processFile(filePath);
        
        if (chunks.length > 0) {
          await this.indexChunks(chunks);
        }
      }
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      // 6. Résumé
      console.log('╔════════════════════════════════════════════════════════════╗');
      console.log('║     RÉSUMÉ DE L\'INDEXATION                                 ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');
      console.log(`   📊 Statistiques:`);
      console.log(`      Fichiers traités:       ${this.stats.filesProcessed}`);
      console.log(`      Chunks créés:           ${this.stats.chunksCreated}`);
      console.log(`      Embeddings générés:     ${this.stats.embeddingsGenerated}`);
      console.log(`      Erreurs:                ${this.stats.errors}`);
      console.log(`      Durée totale:           ${duration}s`);
      console.log('');
      console.log(`   🗄️  Collection: ${CHROMA_COLLECTION}`);
      console.log(`   🔢 Dimension:   768d (nomic-embed-text)`);
      console.log(`   📏 Distance:    Cosine similarity`);
      console.log('');
      
      if (this.stats.errors > 0) {
        console.log('⚠️  Indexation terminée avec des erreurs\n');
      } else {
        console.log('✅ Indexation réussie!\n');
        console.log('Prochaines étapes:');
        console.log('  1. Tester le RAG: npx tsx scripts/test-local-rag.ts');
        console.log('  2. Démarrer le backend: npm run dev');
        console.log('  3. Tester les endpoints Neural Nexus');
        console.log('');
      }
    } catch (error: any) {
      console.error('\n💥 ERREUR FATALE:', error.message);
      console.error('\nStacktrace:', error.stack);
      process.exit(1);
    }
  }
}

// Exécution
const indexer = new KnowledgeBaseIndexer();
indexer.run().catch((error) => {
  console.error('💥 Exception non gérée:', error);
  process.exit(1);
});
