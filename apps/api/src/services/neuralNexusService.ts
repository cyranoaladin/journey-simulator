/**
 * Project: Money Factory AI (MFAI)
 * Neural Nexus - RAG Retrieval & Augmentation Logic
 * Status: Production Ready - 2026 (Enhanced with OpenAI Embeddings)
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA
 */

import { prisma } from '../config/database';
import OpenAI from 'openai';

/**
 * Interface for retrieved context chunks
 */
export interface ContextChunk {
  id: string;
  content: string;
  metadata: {
    title: string;
    category?: string;
    tags?: string[];
    source?: string;
  };
  score: number;
}

/**
 * Interface for agent query processing result
 */
export interface AgentQueryResult {
  promptUsed: string;
  response?: string;
  source: 'rag_augmented' | 'direct' | 'insufficient_context';
  confidenceScore: number;
  status: 'success' | 'insufficient_context' | 'error';
  context?: ContextChunk[];
}

// Initialize OpenAI client (lazy loaded)
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (process.env.SKIP_OPENAI === 'true' || process.env.USE_OLLAMA === 'true') {
    return null;
  }
  
  if (process.env.SKIP_OPENAI === 'true') {
    return null;
  }
  
  if (!openaiClient && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'mock-key-safe') {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  return openaiClient;
}

function getOllamaClient() {
  if (process.env.USE_OLLAMA !== 'true') {
    return null;
  }
  
  try {
    const { ollama } = require('../utils/ollamaClient');
    return ollama;
  } catch (error) {
    console.warn('[Neural Nexus] Ollama client not available:' , error);
    return null;
  }
}

/**
 * Calculate cosine similarity between two vectors
 * Formula: similarity = (A · B) / (||A|| × ||B||)
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Simple text-based embedding generation (fallback)
 * Used when OpenAI is unavailable or disabled
 */
function generateSimpleEmbedding(text: string): number[] {
  const tokens = text.toLowerCase().split(/\s+/);
  const vocab = ['solana', 'defi', 'liquidity', 'mfai', 'nft', 'token', 'blockchain', 'audit', 'security'];
  
  return vocab.map(word => {
    const count = tokens.filter(t => t.includes(word)).length;
    return count / (tokens.length || 1);
  });
}

/**
 * Generate embeddings using OpenAI's text-embedding-3-small model
 * Returns 1536-dimensional vector
 */
async function generateOpenAIEmbedding(text: string): Promise<number[] | null> {
  try {
    const client = getOpenAIClient();
    if (!client) {
      return null;
    }
    
    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.substring(0, 8000),
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('[Neural Nexus] OpenAI embedding error:', error);
    return null;
  }
}

/**
 * Generate embeddings using Ollama local model
 * Returns embedding vector (dimension depends on model, default nomic-embed-text: 768d)
 */
async function generateOllamaEmbedding(text: string): Promise<number[] | null> {
  try {
    const client = getOllamaClient();
    if (!client) {
      return null;
    }
    
    const model = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';
    const response = await client.embeddings({
      model,
      prompt: text.substring(0, 8000),
    });
    
    return response.embedding || null;
  } catch (error: any) {
    console.error('[Neural Nexus] Ollama embedding error:' , error);
    if (error.message?.includes('not found')) {
      const model = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';
      console.error(`[Neural Nexus] Pull the model with: ollama pull ${model}`);
    }
    return null;
  }
}

/**
 * Unified embedding generation function
 * Tries OpenAI first (production), falls back to simple embeddings (development)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Use Ollama if enabled
  if (process.env.USE_OLLAMA === 'true') {
    const ollamaEmbedding = await generateOllamaEmbedding(text);
    if (ollamaEmbedding && ollamaEmbedding.length > 0) {
      return ollamaEmbedding;
    }
    console.warn('[Neural Nexus] Ollama embedding failed, falling back to simple');
    return generateSimpleEmbedding(text);
  }
  
  // Use OpenAI if available
  const openaiEmbedding = await generateOpenAIEmbedding(text);
  if (openaiEmbedding && openaiEmbedding.length > 0) {
    return openaiEmbedding;
  }
  
  // Fallback to simple embeddings
  return generateSimpleEmbedding(text);
}

/**
 * Retrieve relevant context from vector store based on query similarity
 * Uses cosine similarity for semantic search
 */
export async function retrieveContext(
  query: string,
  limit: number = 5
): Promise<ContextChunk[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);
    
    const documents = await prisma.doc.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        embedding: true,
        category: true,
        tags: true,
      },
    });
    
    if (documents.length === 0) {
      console.warn('[Neural Nexus] No documents in knowledge base');
      return [];
    }
    
    const scoredDocs = await Promise.all(
      documents.map(async doc => {
        let docEmbedding = doc.embedding;
        
        if (docEmbedding.length === 0) {
          docEmbedding = await generateEmbedding(doc.content);
        }
        
        const score = cosineSimilarity(queryEmbedding, docEmbedding);
        
        return {
          id: doc.id,
          content: doc.content,
          metadata: {
            title: doc.title,
            category: doc.category || undefined,
            tags: doc.tags,
          },
          score,
        };
      })
    );
    
    return scoredDocs
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error('[Neural Nexus] Retrieval error:', error);
    return [];
  }
}

/**
 * Process agent query with RAG augmentation
 * Injects retrieved context into the agent prompt
 */
export async function processAgentQuery(
  query: string,
  options?: {
    agentId?: string;
    manualContext?: string;
    minConfidence?: number;
  }
): Promise<AgentQueryResult> {
  try {
    const minConfidence = options?.minConfidence || 0.3;
    
    if (options?.manualContext) {
      const promptUsed = `Context: ${options.manualContext}\n\nQuery: ${query}\n\nPlease answer based on the provided context.`;
      
      return {
        promptUsed,
        source: 'rag_augmented',
        confidenceScore: 1.0,
        status: 'success',
      };
    }
    
    const context = await retrieveContext(query, 3);
    
    if (context.length === 0 || context[0].score < minConfidence) {
      return {
        promptUsed: query,
        source: 'insufficient_context',
        confidenceScore: context[0]?.score || 0,
        status: 'insufficient_context',
        context,
      };
    }
    
    const contextText = context
      .map(chunk => `[${chunk.metadata.title}]\n${chunk.content}`)
      .join('\n\n---\n\n');
    
    const promptUsed = `Context from knowledge base:\n\n${contextText}\n\n---\n\nUser Query: ${query}\n\nPlease answer based on the provided context.`;
    
    return {
      promptUsed,
      source: 'rag_augmented',
      confidenceScore: context[0].score,
      status: 'success',
      context,
    };
  } catch (error) {
    console.error('[Neural Nexus] Query processing error:', error);
    return {
      promptUsed: query,
      source: 'direct',
      confidenceScore: 0,
      status: 'error',
    };
  }
}

/**
 * Persist RAG interaction to AgentLog for observability
 */
export async function logRagInteraction(
  journeyId: string,
  agentId: string,
  query: string,
  result: AgentQueryResult
): Promise<void> {
  try {
    await prisma.agentLog.create({
      data: {
        journeyId,
        agent: agentId,
        action: 'rag_query',
        details: {
          query,
          source: result.source,
          confidenceScore: result.confidenceScore,
          contextChunks: result.context?.length || 0,
          status: result.status,
        },
        status: result.status === 'success' ? 'ok' : 'warning',
      },
    });
  } catch (error) {
    console.error('[Neural Nexus] Log persistence error:', error);
  }
}
