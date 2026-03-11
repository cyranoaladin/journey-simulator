/**
 * Project: Money Factory AI (MFAI)
 * ChromaDB Client - Local Vector Database (replaces Pinecone)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA
 */

const { ChromaClient } = require('chromadb');
const path = require('node:path');
const fs = require('node:fs');
const loggerFactory = require('../utils/logger');
const createLogger = loggerFactory.createLogger || loggerFactory.default || loggerFactory;

const CHROMA_HOST = process.env.CHROMA_HOST || 'http://localhost:8000';
const CHROMA_COLLECTION = process.env.CHROMA_COLLECTION || 'mfai_knowledge_base';
const LOCAL_RAG_DIR = process.env.RAG_DATA_PATH || path.resolve(__dirname, '../docs');

class ChromaDBClient {
  constructor() {
    this.logger = createLogger(__filename);
    this.client = null;
    this.collection = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      this.client = new ChromaClient({ path: CHROMA_HOST });
      
      try {
        this.collection = await this.client.getOrCreateCollection({
          name: CHROMA_COLLECTION,
          metadata: { description: 'MFAI RAG Knowledge Base' },
        });
        this.initialized = true;
        this.logger.info('ChromaDB initialized', {
          host: CHROMA_HOST,
          collection: CHROMA_COLLECTION,
        });
      } catch (collectionError) {
        this.logger.warn('ChromaDB collection creation failed', {
          error: collectionError.message,
        });
        this.initialized = false;
      }
    } catch (error) {
      this.logger.warn('ChromaDB connection failed', {
        host: CHROMA_HOST,
        error: error.message,
      });
      this.initialized = false;
    }
  }

  async isAvailable() {
    try {
      await this.initialize();
      return this.initialized;
    } catch {
      return false;
    }
  }

  async search({ query, topK = 4, traceId, domain }) {
    const started = Date.now();
    
    try {
      await this.initialize();
      
      if (!this.initialized || !this.collection) {
        this.logger.warn('ChromaDB not available, using local fallback', { traceId });
        return this.localFallback(query, topK, traceId);
      }

      const domainQuery = domain ? `${query} ${domain}` : query;
      
      const results = await this.collection.query({
        queryTexts: [domainQuery],
        nResults: topK,
      });

      const latencyMs = Date.now() - started;

      if (!results.documents || results.documents.length === 0 || !results.documents[0]) {
        this.logger.info('ChromaDB returned no results, using local fallback', { traceId });
        return this.localFallback(query, topK, traceId);
      }

      const chunks = results.documents[0].map((doc, i) => ({
        id: results.ids?.[0]?.[i] || `chroma-${i}`,
        title: results.metadatas?.[0]?.[i]?.title || `Document ${i + 1}`,
        text: doc || '',
        source: 'chromadb',
        score: results.distances?.[0]?.[i] || 0,
      }));

      this.logger.info('ChromaDB search success', {
        traceId,
        latencyMs,
        count: chunks.length,
      });

      return {
        chunks,
        latencyMs,
        source: 'chromadb',
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error('ChromaDB search error', { traceId, error: errorMsg });
      return this.localFallback(query, topK, traceId);
    }
  }

  localFallback(query, topK, traceId) {
    const started = Date.now();
    
    if (!fs.existsSync(LOCAL_RAG_DIR)) {
      this.logger.warn('Local RAG directory not found', {
        traceId,
        path: LOCAL_RAG_DIR,
      });
      return { chunks: [], latencyMs: 0, source: 'local_empty' };
    }

    const files = this.walkDocs(LOCAL_RAG_DIR);
    const normalized = (query || '').toLowerCase();
    const tokens = normalized.split(/\s+/).filter(Boolean);

    const scored = files.map((file) => {
      if (!tokens.length) {
        return { ...file, score: 1 };
      }
      const lower = file.text.toLowerCase();
      const score = tokens.reduce((acc, token) => {
        if (!token) return acc;
        const occurrences = lower.split(token).length - 1;
        return acc + Math.max(occurrences, 0);
      }, 0);
      return { ...file, score };
    });

    const chunks = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((f, idx) => ({
        id: f.id || `local-${idx}`,
        title: f.title,
        text: f.text,
        source: 'local',
        score: f.score,
      }));

    const latencyMs = Date.now() - started;
    this.logger.info('Local RAG fallback', { traceId, latencyMs, count: chunks.length });

    return { chunks, latencyMs, source: 'local' };
  }

  walkDocs(dir) {
    const results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const ent of entries) {
      const fullPath = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        results.push(...this.walkDocs(fullPath));
      } else if (ent.isFile() && (ent.name.endsWith('.md') || ent.name.endsWith('.txt'))) {
        const text = fs.readFileSync(fullPath, 'utf-8');
        results.push({
          id: fullPath,
          title: ent.name.replace(/\.(md|txt)$/, ''),
          text: text.substring(0, 4000),
        });
      }
    }
    return results;
  }

  async addDocuments(documents) {
    try {
      await this.initialize();
      
      if (!this.initialized || !this.collection) {
        throw new Error('ChromaDB not initialized');
      }

      const ids = documents.map((_, i) => `doc-${Date.now()}-${i}`);
      const docs = documents.map(d => d.text || d.content || '');
      const metadatas = documents.map(d => ({
        title: d.title || 'Untitled',
        category: d.category || 'general',
        source: d.source || 'import',
      }));

      await this.collection.add({
        ids,
        documents: docs,
        metadatas,
      });

      this.logger.info('Documents added to ChromaDB', { count: documents.length });
      return { success: true, count: documents.length };
    } catch (error) {
      this.logger.error('Failed to add documents to ChromaDB', {
        error: error.message,
      });
      throw error;
    }
  }

  async clear() {
    try {
      await this.initialize();
      
      if (this.client && this.collection) {
        await this.client.deleteCollection({ name: CHROMA_COLLECTION });
        this.collection = null;
        this.initialized = false;
        this.logger.info('ChromaDB collection cleared');
      }
    } catch (error) {
      this.logger.error('Failed to clear ChromaDB', { error: error.message });
    }
  }
}

module.exports = { ChromaDBClient };
