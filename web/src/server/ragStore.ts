import { embedText, cosine } from './embeddings'

type StoredDoc = {
  id: string
  title: string
  content: string
  tags?: string
  embedding: number[]
  createdAt: number
}

type RagStore = {
  docs: StoredDoc[]
}

const GLOBAL_KEY = Symbol.for('mfai.ragStore')
const globalAny = globalThis as typeof globalThis & { [GLOBAL_KEY]?: RagStore }

if (!globalAny[GLOBAL_KEY]) {
  globalAny[GLOBAL_KEY] = { docs: [] }
}

const store = globalAny[GLOBAL_KEY]!

function makeId() {
  return `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function resetRagStore() {
  store.docs = []
}

export function createDoc(input: { title: string; content: string; tags?: string }) {
  const embedding = embedText(`${input.title} ${input.content} ${input.tags ?? ''}`)
  const doc: StoredDoc = {
    id: makeId(),
    title: input.title,
    content: input.content,
    tags: input.tags,
    embedding,
    createdAt: Date.now(),
  }
  store.docs.push(doc)
  return doc
}

export function batchCreateDocs(items: Array<{ title: string; content: string; tags?: string }>) {
  return items.map((item) => createDoc(item))
}

export function listRecentDocs(limit: number) {
  return store.docs
    .slice(-limit)
    .reverse()
    .map((doc) => ({
      id: doc.id,
      path: doc.title,
      meta: { embedding: doc.embedding, tags: doc.tags },
      content: doc.content,
    }))
}

export function queryDocs(limit: number, query: string) {
  if (!query) return []
  const q = query.toLowerCase()
  return store.docs
    .filter((doc) =>
      [doc.title, doc.content, doc.tags]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    )
    .slice(0, limit)
    .map((doc) => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      tags: doc.tags,
    }))
}

export function rankDocs(limit: number, text: string) {
  const queryEmbedding = embedText(text)
  return store.docs
    .map((doc) => ({
      doc,
      score: cosine(queryEmbedding, doc.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ doc, score }) => ({
      id: doc.id,
      path: doc.title,
      meta: { embedding: doc.embedding, tags: doc.tags },
      score,
    }))
}
