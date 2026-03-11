/**
 * Ollama Mock for Unit Tests
 * Simulates local Ollama responses for testing
 */

const mockOllamaResponses = {
  chat: {
    message: {
      role: 'assistant',
      content: 'This is a mock response from Ollama local model.',
    },
    prompt_eval_count: 50,
    eval_count: 100,
  },
  embedding: Array.from({ length: 768 }, () => Math.random()),
};

const createMockOllamaClient = () => ({
  chat: jest.fn().mockResolvedValue(mockOllamaResponses.chat),
  embeddings: jest.fn().mockResolvedValue({
    embedding: mockOllamaResponses.embedding,
  }),
  list: jest.fn().mockResolvedValue({
    models: [
      { name: 'qwen2.5:7b' },
      { name: 'llama3:8b' },
      { name: 'nomic-embed-text' },
    ],
  }),
});

module.exports = {
  Ollama: jest.fn().mockImplementation(() => createMockOllamaClient()),
  createMockOllamaClient,
  mockOllamaResponses,
};
