// 📄 rag/ragClient.js

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const RAG_SEARCH_URL = process.env.RAG_SEARCH_URL || 'http://localhost:8000/kb/search';
const RAG_INGEST_URL = process.env.RAG_INGEST_URL || 'http://localhost:8000/kb/ingest';
const RAG_API_KEY = process.env.RAG_API_KEY || '';
const RAG_COLLECTION = process.env.RAG_COLLECTION || 'mfai-knowledge';
const RAG_DATA_PATH = process.env.RAG_DATA_PATH || path.resolve(__dirname, '../data/rag-documents');

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
  const userContext = typeof options === 'string' ? undefined : options.userContext;
  const normalizedQuery = query && query.trim().length > 0 ? query : 'web3 knowledge base';
  const authorId = userContext?.id || userContext?.userId || 'demo-user';

  try {
    const res = await axios.post(
      RAG_SEARCH_URL,
      { q: normalizedQuery, collection: RAG_COLLECTION, k: 5, include_documents: true, metadata: { user: authorId } },
      { headers: { 'x-api-key': RAG_API_KEY }, timeout: 5000 }
    );
    return Array.isArray(res.data?.snippets) ? res.data.snippets : [];
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    if (process.env.NODE_ENV !== 'test') {
      console.warn('RAG search failed:', errorMsg);
    }
    // Return local fallback, ensuring it's always an array
    const fallback = readLocalFallback(normalizedQuery);
    return Array.isArray(fallback) ? fallback : [];
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
