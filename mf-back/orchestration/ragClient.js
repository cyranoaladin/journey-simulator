/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const axios = require('axios');
const fs = require('node:fs');
const path = require('node:path');
const loggerFactory = require('../utils/logger');
const createLogger = loggerFactory.createLogger || loggerFactory.default || loggerFactory;

const RAG_SEARCH_URL = process.env.RAG_SEARCH_URL || '';
const RAG_API_KEY = process.env.RAG_API_KEY || '';
const LOCAL_RAG_DIR = process.env.RAG_DATA_PATH || path.resolve(__dirname, '../docs');

class RAGClient {
  constructor() {
    this.logger = createLogger(__filename);
  }

  async search({ query, topK = 4, traceId, domain }) {
    const started = Date.now();
    const domainQuery = domain ? `${query} ${domain}` : query;
    if (RAG_SEARCH_URL) {
      try {
        const res = await axios.post(
          RAG_SEARCH_URL,
          { q: domainQuery, k: topK },
          { headers: { 'x-api-key': RAG_API_KEY }, timeout: 5000 }
        );
        const latencyMs = Date.now() - started;
        const snippets = Array.isArray(res.data?.snippets)
          ? res.data.snippets.map((s, i) => ({
            id: s.id || `remote-${i}`,
            title: s.title || `snippet-${i}`,
            text: s.content || s.text || '',
            source: s.source || 'remote',
          }))
          : [];
        this.logger.info('RAG remote success', { traceId, latencyMs, count: snippets.length });
        return { chunks: snippets.slice(0, topK), latencyMs, source: 'remote' };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        this.logger.warn('RAG remote failed, fallback to local', { traceId, error: errorMsg });
        // Continue to local fallback below
      }
    }

    const latencyStart = Date.now();
    const chunks = this.readLocal(domainQuery, topK);
    const latencyMs = Date.now() - latencyStart;
    this.logger.info('RAG local fallback', { traceId, latencyMs, count: chunks.length });
    return { chunks, latencyMs, source: 'local' };
  }

  readLocal(query = '', topK = 4) {
    if (!fs.existsSync(LOCAL_RAG_DIR)) return [];
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
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((f, idx) => ({
        id: f.id || `local-${idx}`,
        title: f.title,
        text: f.text,
        source: f.source,
      }));
  }

  walkDocs(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const results = [];
    entries.forEach((entry) => {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...this.walkDocs(abs));
      } else if (/\.(md|txt)$/i.test(entry.name)) {
        const text = fs.readFileSync(abs, 'utf8');
        results.push({
          id: abs,
          title: path.basename(entry.name, path.extname(entry.name)),
          text,
          source: abs.replace(process.cwd(), ''),
        });
      }
    });
    return results;
  }
}

module.exports = { RAGClient };
