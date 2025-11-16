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
  return fs
    .readdirSync(RAG_DATA_PATH)
    .filter((file) => /\.(md|txt)$/i.test(file))
    .map((file) => {
      const fullPath = path.join(RAG_DATA_PATH, file);
      const content = fs.readFileSync(fullPath, 'utf8');
      return {
        title: path.basename(file, path.extname(file)),
        content
      };
    })
    .filter((snippet) => {
      if (!normalized) {
        return true;
      }
      return (
        snippet.title.toLowerCase().includes(normalized) ||
        snippet.content.toLowerCase().includes(normalized)
      );
    })
    .slice(0, 5);
};

module.exports.getRagSnippets = async (options = {}) => {
  const query = typeof options === 'string' ? options : options.query;
  const userContext = typeof options === 'string' ? undefined : options.userContext;
  const normalizedQuery = query && query.trim().length > 0 ? query : 'web3 knowledge base';
  const authorId = userContext?.id || userContext?.userId || 'demo-user';

  try {
    const res = await axios.post(
      RAG_SEARCH_URL,
      { query: normalizedQuery, collection: RAG_COLLECTION, metadata: { user: authorId } },
      { headers: { 'x-api-key': RAG_API_KEY } }
    );
    return res.data.snippets || [];
  } catch (e) {
    console.warn('RAG search failed:', e.message);
    return readLocalFallback(normalizedQuery);
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
    console.warn('RAG ingestion failed:', e.message);
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
    console.warn('RAG single document ingestion failed:', e.message);
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
    console.warn('Failed to persist RAG document locally:', error.message);
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