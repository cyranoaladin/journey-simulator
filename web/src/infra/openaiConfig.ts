export type OpenAIConfig = {
  apiKey: string
  url: string
  model: string
  maxTokens: number
  temperature: number
}

export function getOpenAIConfig(kind: 'step'|'eval' = 'step'): OpenAIConfig {
  const apiKey = process.env.OPENAI_API_KEY || ''
  const url = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/responses'
  const model = process.env.LLM_MODEL_NAME || 'gpt-5.1'
  const maxTokens = Number(process.env.LLM_MAX_OUTPUT_TOKENS || 1500)
  const defaultTemp = kind === 'eval' ? 0.3 : 0.4
  const temperature = Number(process.env.LLM_TEMPERATURE || defaultTemp)
  return { apiKey, url, model, maxTokens, temperature }
}
