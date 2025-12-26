const axios = require('axios');
const fs = require('fs');
const path = require('path');
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
        this.logger.warn('RAG remote failed, fallback to local', { traceId, error: error.message });
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
    const scored = files.map((file) => {
      const score = normalized
        ? (file.text.toLowerCase().match(new RegExp(normalized.split(/\s+/).join('|'), 'g')) || []).length
        : 1;
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
