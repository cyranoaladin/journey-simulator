/**
 * RAG Search Implementation
 * Integrates with Pinecone vector DB for knowledge retrieval
 */

import { Pinecone } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings } from '@langchain/openai'

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || '' })
const index = pc.Index(process.env.PINECONE_INDEX_NAME || 'journey')

const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-small',
  openAIApiKey: process.env.OPENAI_API_KEY,
})

export interface RAGResult {
  chunk: string
  score: number
  source: string
  author?: string
  url?: string
}

/**
 * Search knowledge base by query
 */
export async function searchKnowledgeBase(query: string, topK: number = 5): Promise<RAGResult[]> {
  try {
    // Embed the query
    const queryEmbedding = await embeddings.embedQuery(query)

    // Search Pinecone
    const results = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    })

    // Format results
    return results.matches.map((match) => ({
      chunk: (match.metadata?.text as string) || '',
      score: match.score || 0,
      source: (match.metadata?.source as string) || 'unknown',
      author: (match.metadata?.author as string) || undefined,
      url: (match.metadata?.url as string) || undefined,
    }))
  } catch (error) {
    console.error('[RAG] Search failed', error)
    return []
  }
}

/**
 * Ingest single document
 */
export async function ingestDocument(
  title: string,
  content: string,
  source: string,
  author?: string,
  url?: string
): Promise<string> {
  try {
    // Split into chunks (recursive, 512 tokens, 100 overlap)
    const { RecursiveCharacterTextSplitter } = await import('langchain/text_splitter')
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 512,
      chunkOverlap: 100,
    })

    const chunks = await splitter.splitText(content)

    // Embed and index
    const vectors = []
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embeddings.embedQuery(chunks[i])
      vectors.push({
        id: `${source.replace(/\s+/g, '-')}-chunk-${i}`,
        values: embedding,
        metadata: {
          text: chunks[i],
          title,
          source,
          author: author || 'unknown',
          url: url || '',
          chunk_index: i,
          created_at: new Date().toISOString(),
        },
      })
    }

    // Upsert to Pinecone (batch)
    const batchSize = 100
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize)
      await index.upsert(batch)
    }

    return `Ingested ${chunks.length} chunks from ${source}`
  } catch (error) {
    console.error('[RAG] Ingest failed', error)
    throw error
  }
}

/**
 * Batch ingest from JSON array
 */
export async function ingestBatch(documents: Array<{ title: string; content: string; source: string }>) {
  const results = []
  for (const doc of documents) {
    const result = await ingestDocument(doc.title, doc.content, doc.source)
    results.push(result)
  }
  return results
}

/**
 * Delete documents by source
 */
export async function deleteDocumentsBySource(source: string): Promise<void> {
  try {
    // Pinecone delete by filter
    await index.deleteMany({
      filter: {
        source: source,
      },
    })
  } catch (error) {
    console.error('[RAG] Delete failed', error)
  }
}

/**
 * Build RAG context for Zyno
 */
export async function buildRAGContext(userQuery: string, topK: number = 3): Promise<string> {
  const results = await searchKnowledgeBase(userQuery, topK)

  if (results.length === 0) {
    return ''
  }

  return results
    .map((r) => `**[${r.source}]** (Relevance: ${(r.score * 100).toFixed(0)}%)\n\n${r.chunk}`)
    .join('\n\n---\n\n')
}
