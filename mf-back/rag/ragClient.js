/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

// 📄 rag/ragClient.js

const axios = require('axios');
const fs = require('node:fs');
const path = require('node:path');

const RAG_BASE_URL = process.env.RAG_BASE_URL || 'http://localhost:8000';
const RAG_SEARCH_URL = process.env.RAG_SEARCH_URL || `${RAG_BASE_URL}/kb/search`;
const RAG_INGEST_URL = process.env.RAG_INGEST_URL || `${RAG_BASE_URL}/kb/ingest`;
const RAG_API_KEY = process.env.RAG_API_KEY || '';
const RAG_COLLECTION = process.env.RAG_COLLECTION || 'mfai-knowledge';
const RAG_DATA_PATH = process.env.RAG_DATA_PATH || path.resolve(__dirname, '../data/rag-documents');
const RAG_MAX_TOPK = parseInt(process.env.RAG_MAX_TOPK || '10', 10);

/* PATCH_RAGCLIENT_ROUTING_V1 */
const selectCollection = ({ query, domain, collectionOverride }) => {
  if (collectionOverride && collectionOverride.trim().length > 0) {
    return collectionOverride;
  }
  const domainQuery = domain ? `${query} ${domain}` : query;
  if (/web3|solana|defi|spl|anchor|rpc|metaplex|token-?2022|raydium|jupiter/i.test(domainQuery)) {
    return 'web3_rag';
  }
  return process.env.RAG_COLLECTION || 'mfai-knowledge';
};

const readLocalFallback = (query = '') => {
  if (!fs.existsSync(RAG_DATA_PATH)) {
    return [];
  }

  const normalized = query.toLowerCase();
  const allFiles = fs
    .readdirSync(RAG_DATA_PATH)
    .filter((file) => /\.(md|txt)$/i.test(file))
    .map((file) => {
      const fullPath = path.join(RAG_DATA_PATH, file);
      const content = fs.readFileSync(fullPath, 'utf8');
      return {
        title: path.basename(file, path.extname(file)),
        content
      };
    });

  const filtered = allFiles.filter((snippet) => {
    if (!normalized) {
      return true;
    }
    // Relaxed matching: check if any keyword from query exists in title/content
    // Or just return true if query is very long (likely a full prompt)
    if (normalized.length > 50) return true;

    return (
      snippet.title.toLowerCase().includes(normalized) ||
      snippet.content.toLowerCase().includes(normalized)
    );
  });

  // If strict filter returns nothing, return all files (fallback to ensure context)
  return (filtered.length > 0 ? filtered : allFiles).slice(0, 5);
};

module.exports.getRagSnippets = async (options = {}) => {
  const query = typeof options === 'string' ? options : options.query;
  const domain = typeof options === 'object' ? options.domain : undefined;
  const collectionOverride = typeof options === 'object' ? options.collection : undefined;

  const userContext = typeof options === 'string' ? undefined : options.userContext;
  const normalizedQuery = query && query.trim().length > 0 ? query : 'web3 knowledge base';
  const authorId = userContext?.id || userContext?.userId || 'demo-user';

  /* PATCH_RAGCLIENT_NORMALIZE_TOPK_V1 */
  const topK = (typeof options === 'object' && Number.isInteger(options.k)) ? options.k : (typeof options === 'object' && Number.isInteger(options.topK) ? options.topK : 5);
  const safeTopK = Math.max(1, Math.min(RAG_MAX_TOPK, topK));

  const targetCollection = selectCollection({ query: normalizedQuery, domain, collectionOverride });
  if (process.env.TEST_RAG_ROUTING) console.log(`[TEST_RAG] Query: "${normalizedQuery}" -> Collection: "${targetCollection}"`);

  try {
    const res = await axios.post(
      RAG_SEARCH_URL,
      { q: normalizedQuery, collection: targetCollection, k: safeTopK, include_documents: true, metadata: { user: authorId } },
      { headers: { 'x-api-key': RAG_API_KEY }, timeout: 5000 }
    );

    // Remote Normalization
    const rawSnippets = Array.isArray(res.data?.snippets) ? res.data.snippets : [];
    return rawSnippets.slice(0, safeTopK).map((s, i) => {
      const content = s.content || s.text || '';
      const title = s.title || s.metadata?.title || `snippet-${i}`;
      const score = (typeof s.score === 'number') ? s.score : ((typeof s.metadata?.score === 'number') ? s.metadata.score : null);

      // Attempt to deduce type from title if missing
      let docType = s.metadata?.type || 'unknown';
      if (docType === 'unknown' && title.includes('.')) {
        docType = title.split('.').pop();
      }

      return {
        id: s.id || `remote-${i}`,
        title,
        content,
        text: content, // Alias for compatibility
        source: targetCollection,
        score,
        metadata: {
          ...(s.metadata || {}),
          source: targetCollection,
          title,
          score,
          type: docType
        }
      };
    });

  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    // Suppress warning as requested by user - fallback is active
    // if (process.env.NODE_ENV !== 'test') {
    //   console.warn('[RAG_NOTICE]: Remote RAG unreachable, using local knowledge base', errorMsg);
    // }

    // Circuit breaker: immediate local fallback with normalization
    if (process.env.STRICT_RAG_MODE === 'true') {
      throw new Error(`[STRICT_RAG_MODE] Remote RAG query failed and fallback is disabled. Error: ${errorMsg}`);
    }

    const fallback = readLocalFallback(normalizedQuery);
    if (!Array.isArray(fallback)) return [];

    return fallback.slice(0, safeTopK).map((doc, i) => {
      const content = doc.content || doc.text || '';
      const title = doc.title || `local-${i}`;

      return {
        id: `local-${i}`,
        title,
        content,
        text: content,
        source: 'local_fallback',
        score: null,
        metadata: {
          source: 'local_fallback',
          title,
          type: 'local',
          score: null,
          tag: 'UNVERIFIED_LOCAL' // Preserve context
        }
      };
    });
  }
};

module.exports.ingestDocumentsIfNeeded = async ({ userId, phase }) => {
  const docsToIngest = [
    { title: `Intro ${phase}`, type: 'md', content: `Phase actuelle : ${phase}` }
  ];

  try {
    const res = await axios.post(
      RAG_INGEST_URL,
      {
        collection: RAG_COLLECTION,
        documents: docsToIngest.map(doc => ({
          title: doc.title,
          content: doc.content,
          metadata: { userId, phase }
        }))
      },
      { headers: { 'x-api-key': RAG_API_KEY } }
    );
    return res.data.documents || [];
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    if (process.env.NODE_ENV !== 'test') {
      console.warn('RAG ingestion failed:', errorMsg);
    }
    return docsToIngest;
  }
};

module.exports.ingestDocument = async (content, metadata = {}) => {
  let remoteDocuments = [];

  try {
    const res = await axios.post(
      RAG_INGEST_URL,
      {
        collection: RAG_COLLECTION,
        documents: [
          {
            title: metadata.title || 'uploaded-document',
            content,
            metadata: {
              ...metadata,
              uploadedAt: new Date().toISOString(),
            },
          },
        ],
      },
      { headers: { 'x-api-key': RAG_API_KEY } }
    );

    remoteDocuments = res.data.documents || [];
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    if (process.env.NODE_ENV !== 'test') {
      console.warn('RAG single document ingestion failed:', errorMsg);
    }
  }

  try {
    if (!content) {
      return remoteDocuments;
    }

    const safeTitle = (metadata.title || `rag-upload-${Date.now()}`).replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
    const extension = metadata.type && metadata.type.includes('markdown') ? '.md' : '.txt';
    const targetPath = path.join(RAG_DATA_PATH, `${safeTitle}${extension}`);
    fs.mkdirSync(RAG_DATA_PATH, { recursive: true });
    fs.writeFileSync(targetPath, content, 'utf8');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (process.env.NODE_ENV !== 'test') {
      console.warn('Failed to persist RAG document locally:', errorMsg);
    }
  }

  return remoteDocuments.length > 0
    ? remoteDocuments
    : [
      {
        title: metadata.title || 'uploaded-document',
        content,
      },
    ];
};
