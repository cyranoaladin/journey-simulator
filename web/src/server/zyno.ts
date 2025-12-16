type JourneyStepInput = {
  userId?: string
  personaId?: string
  trackId: string
  phaseId: string
  language: 'fr' | 'en'
  mode?: 'discovery' | 'builder' | 'expert'
  tone?: 'pedagogical' | 'investor_pitch' | 'critical'
  journeyState?: any
  userInput?: string
  actionId?: string
}

const JOURNEY_STEP_SCHEMA = {
  name: 'JourneyStepResponse',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'JourneyStepResponse',
    type: 'object',
    required: ['metadata', 'ui_blocks', 'agent_actions', 'next_state'],
    properties: {
      metadata: {
        type: 'object',
        required: ['persona_id', 'journey_track', 'phase_id', 'language'],
        properties: {
          persona_id: { type: 'string' },
          journey_track: { type: 'string' },
          phase_id: { type: 'string' },
          language: { type: 'string', enum: ['fr', 'en'] },
          mode: { type: 'string', enum: ['discovery', 'builder', 'expert'] },
          tone: { type: 'string', enum: ['pedagogical', 'investor_pitch', 'critical'] },
          title: { type: 'string' },
          summary: { type: 'string' },
        },
        additionalProperties: false,
      },
      ui_blocks: { type: 'array' },
      agent_actions: { type: 'array' },
      next_state: { type: 'object' },
    },
  },
  strict: true,
}

function buildSystemPrompt(): string {
  return [
    'Tu es Zyno, orchestrateur des parcours Money Factory AI – Journey Simulator.',
    'Rends uniquement un JSON strict conforme au schema JourneyStepResponse.',
    'Compose des blocs UI actionnables (missions, quiz, documents, ressources) et suggère next_state.',
  ].join('\n')
}

function buildUserPrompt(input: JourneyStepInput): string {
  return [
    `userId=${input.userId ?? 'demo'}`,
    `personaId=${input.personaId ?? 'unknown'}`,
    `trackId=${input.trackId}`,
    `phaseId=${input.phaseId}`,
    `language=${input.language}`,
    `mode=${input.mode ?? 'discovery'}`,
    `tone=${input.tone ?? 'pedagogical'}`,
    `actionId=${input.actionId ?? ''}`,
    `journeyState=${JSON.stringify(input.journeyState ?? {})}`,
    `userInput=${input.userInput ?? ''}`,
  ].join('\n')
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle)
  }
}

export async function callZynoStep(input: JourneyStepInput) {
  const { apiKey, url, model, maxTokens, temperature } = (
    await import('@/infra/openaiConfig')
  ).getOpenAIConfig('step')
  if (!apiKey) throw new Error('OPENAI_API_KEY missing')

  const payload = {
    model,
    input: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: buildUserPrompt(input) },
    ],
    response_format: { type: 'json_schema', json_schema: JOURNEY_STEP_SCHEMA },
    max_output_tokens: maxTokens,
    temperature,
    reasoning: { effort: 'medium' },
  }

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }

  let attempt = 0
  const maxAttempts = 3
  const started = Date.now()
  while (attempt < maxAttempts) {
    try {
      const res = await withTimeout(
        fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) }),
        30000
      )
      if (!res.ok) {
        if (res.status === 429 || res.status >= 500) {
          attempt++
          await new Promise((r) => setTimeout(r, 500 * attempt))
          continue
        }
        const text = await res.text().catch(() => `HTTP ${res.status}`)
        throw new Error(text)
      }
      const json = await res.json()
      // Responses API format: pick first output content if needed
      const content = json?.output?.[0]?.content?.[0]?.text ?? json?.output_text ?? json
      const out = typeof content === 'string' ? JSON.parse(content) : content
      const meta = {
        model,
        duration_ms: Date.now() - started,
        usage: json?.usage || json?.output?.[0]?.usage || undefined,
      }
      try {
        console.log('[ZynoStep]', meta)
      } catch (logError) {
        console.warn('Failed to log Zyno step metrics', logError)
      }
      return { out, meta }
    } catch (e: any) {
      attempt++
      if (attempt >= maxAttempts) throw e
      await new Promise((r) => setTimeout(r, 600 * attempt))
    }
  }
  throw new Error('Zyno call exhausted')
}

// ---- Mission submission / evaluation ----
export type EvaluateInput = {
  trackId?: string
  phaseId?: string
  missionId: string
  inputType: 'text' | 'markdown_document' | 'code_snippet' | 'link' | 'choice'
  submission: string
  language: 'fr' | 'en'
  mode?: 'discovery' | 'builder' | 'expert'
  tone?: 'pedagogical' | 'investor_pitch' | 'critical'
  journeyState?: any
}

function buildEvalSystemPrompt(): string {
  return [
    'Tu es Zyno, évaluateur des missions du Journey Simulator.',
    'You must RETURN ONLY a strict JSON conforming to the JourneyStepResponse schema.',
    '- Inclure au moins un evaluation_block (global_score/100, feedback, axes: Pertinence, Qualité, Exécution).',
    '- Inclure un xp_block avec gained_xp cohérent avec la qualité (0–50).',
    '- next_state.xp_delta doit refléter les points XP gagnés.',
  ].join('\n')
}

function buildEvalUserPrompt(input: EvaluateInput): string {
  return [
    `trackId=${input.trackId ?? ''}`,
    `phaseId=${input.phaseId ?? ''}`,
    `missionId=${input.missionId}`,
    `inputType=${input.inputType}`,
    `language=${input.language}`,
    `mode=${input.mode ?? 'discovery'}`,
    `tone=${input.tone ?? 'pedagogical'}`,
    `journeyState=${JSON.stringify(input.journeyState ?? {})}`,
    '--- Submission Start ---',
    input.submission,
    '--- Submission End ---',
  ].join('\n')
}

export async function callZynoEvaluate(input: EvaluateInput) {
  const { apiKey, url, model, maxTokens, temperature } = (
    await import('@/infra/openaiConfig')
  ).getOpenAIConfig('eval')
  if (!apiKey) throw new Error('OPENAI_API_KEY missing')

  const payload = {
    model,
    input: [
      { role: 'system', content: buildEvalSystemPrompt() },
      { role: 'user', content: buildEvalUserPrompt(input) },
    ],
    response_format: { type: 'json_schema', json_schema: JOURNEY_STEP_SCHEMA },
    max_output_tokens: maxTokens,
    temperature,
    reasoning: { effort: 'low' },
  }

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }

  let attempt = 0
  const maxAttempts = 3
  const started = Date.now()
  while (attempt < maxAttempts) {
    try {
      const res = await withTimeout(
        fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) }),
        30000
      )
      if (!res.ok) {
        if (res.status === 429 || res.status >= 500) {
          attempt++
          await new Promise((r) => setTimeout(r, 500 * attempt))
          continue
        }
        const text = await res.text().catch(() => `HTTP ${res.status}`)
        throw new Error(text)
      }
      const json = await res.json()
      const content = json?.output?.[0]?.content?.[0]?.text ?? json?.output_text ?? json
      const out = typeof content === 'string' ? JSON.parse(content) : content
      const meta = {
        model,
        duration_ms: Date.now() - started,
        usage: json?.usage || json?.output?.[0]?.usage || undefined,
      }
      try {
        console.log('[ZynoEval]', meta)
      } catch (logError) {
        console.warn('Failed to log Zyno eval metrics', logError)
      }
      return { out, meta }
    } catch (e: any) {
      attempt++
      if (attempt >= maxAttempts) throw e
      await new Promise((r) => setTimeout(r, 600 * attempt))
    }
  }
  throw new Error('Zyno evaluation exhausted')
}
