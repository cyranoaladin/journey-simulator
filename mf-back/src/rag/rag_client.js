/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

// 📄 rag/ragClient.js

const axios = require('axios');

const RAG_SEARCH_URL = process.env.RAG_SEARCH_URL || 'https://rag-api.nexusreussite.academy/search';
const RAG_INGEST_URL = process.env.RAG_INGEST_URL || 'https://rag-api.nexusreussite.academy/ingest';
const RAG_API_KEY = process.env.RAG_API_KEY || '';
const RAG_COLLECTION = process.env.RAG_COLLECTION || 'mfai-knowledge';

module.exports.getRagSnippets = async (options = {}) => {
  const query = typeof options === 'string' ? options : options.query;
  const topK = typeof options === 'object' && Number.isInteger(options?.k) ? options.k : 3;
  const normalizedQuery = query && query.trim().length > 0 ? query : 'web3 knowledge base';

  try {
    const res = await axios.post(
      RAG_SEARCH_URL,
      { q: normalizedQuery, collection: RAG_COLLECTION, k: topK },
      { headers: { 'x-api-key': RAG_API_KEY } }
    );
    return res.data.snippets || [];
  } catch (e) {
    console.warn('RAG search failed:', e.message);
    return [];
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
    return [];
  }
};

module.exports.ingestDocument = async (content, metadata = {}) => {
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

    return res.data.documents || [];
  } catch (e) {
    console.warn('RAG single document ingestion failed:', e.message);
    return [];
  }
};