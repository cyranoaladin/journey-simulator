-- =============================================
-- pgvector Setup for Neural Nexus
-- MFAI Real Mode - RAG Performance Enhancement
-- =============================================

-- Step 1: Enable pgvector extension
-- Note: Requires superuser privileges
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Check extension status
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Step 3: Alter Doc table embedding column to use vector type
-- Dimension 1536 matches OpenAI text-embedding-3-small

-- Backup existing embeddings (recommended)
CREATE TABLE IF NOT EXISTS "Doc_backup" AS SELECT * FROM "Doc";

-- Alter the embedding column type
ALTER TABLE "Doc" 
  ALTER COLUMN embedding TYPE vector(1536) 
  USING CASE 
    WHEN array_length(embedding, 1) = 1536 THEN embedding::vector(1536)
    WHEN array_length(embedding, 1) = 9 THEN NULL
    ELSE NULL 
  END;

-- Step 4: Create index for fast similarity search
CREATE INDEX IF NOT EXISTS doc_embedding_idx 
  ON "Doc" 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Step 5: Verify setup
SELECT tablename, indexname FROM pg_indexes WHERE tablename = 'Doc';
