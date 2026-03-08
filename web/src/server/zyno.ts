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

function buildSystemPrompt(): string {
  return `Tu es Zyno, orchestrateur AI des parcours Money Factory AI – Journey Simulator.

RÉPONDS UNIQUEMENT avec un JSON valide (pas de prose, pas de markdown) ayant cette structure exacte:
{
  "metadata": {
    "persona_id": "string",
    "journey_track": "string",
    "phase_id": "string",
    "language": "fr"|"en",
    "mode": "discovery"|"builder"|"expert",
    "tone": "pedagogical"|"investor_pitch"|"critical",
    "title": "string",
    "summary": "string"
  },
  "ui_blocks": [
    // Blocs disponibles: text_block, checklist_block, quiz_block, mission_block, resource_block, xp_block, action_suggestions_block
    // Chaque bloc: { "kind": "...", "id": "unique_id", "title": "...", ...champs spécifiques }
    // text_block: body_markdown
    // checklist_block: items (array de strings)
    // quiz_block: question, choices (array), correct_index, explanation
    // mission_block: description, deliverable, xp_reward
    // resource_block: url, label, description
    // xp_block: gained_xp, total_xp
    // action_suggestions_block: suggestions [{label, action_id}]
  ],
  "agent_actions": [
    // { "action": "string", "agent": "string" }
  ],
  "next_state": {
    "phase_id": "string",
    "xp_delta": number,
    "completed_missions": [],
    "notes": "string"
  }
}

Compose au minimum 3 ui_blocks actionnables et pédagogiques. Sois riche, engageant, précis.`
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

function buildEvalSystemPrompt(): string {
  return `Tu es Zyno, évaluateur des missions du Journey Simulator.

RÉPONDS UNIQUEMENT avec un JSON valide (même structure que JourneyStepResponse) contenant:
- Un evaluation_block: { kind:"evaluation_block", id:"eval_1", title:"Évaluation", global_score: /100, feedback:"...", axes:{Pertinence:n, Qualite:n, Execution:n} }
- Un xp_block: { kind:"xp_block", id:"xp_1", title:"XP gagnés", gained_xp: 0-50, total_xp: n }
- Un text_block avec feedback détaillé
- next_state.xp_delta = XP gagnés`
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

async function callOpenAI(
  apiKey: string,
  url: string,
  payload: object,
  maxAttempts = 3
): Promise<{ out: any; meta: any }> {
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }
  const started = Date.now()
  let attempt = 0

  while (attempt < maxAttempts) {
    try {
      const res = await withTimeout(
        fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) }),
        30000
      )
      if (!res.ok) {
        if (res.status === 429 || res.status >= 500) {
          attempt++
          await new Promise((r) => setTimeout(r, 600 * attempt))
          continue
        }
        const text = await res.text().catch(() => `HTTP ${res.status}`)
        throw new Error(text)
      }
      const json = await res.json()
      // Responses API: output[0].content[0].text
      const raw = json?.output?.[0]?.content?.[0]?.text ?? json?.output_text ?? json
      const out = typeof raw === 'string' ? JSON.parse(raw) : raw
      const meta = {
        model: (payload as any).model,
        duration_ms: Date.now() - started,
        usage: json?.usage || json?.output?.[0]?.usage,
      }
      return { out, meta }
    } catch (e: any) {
      attempt++
      if (attempt >= maxAttempts) throw e
      await new Promise((r) => setTimeout(r, 600 * attempt))
    }
  }
  throw new Error('OpenAI call exhausted retries')
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
    text: { format: { type: 'json_object' } },
    max_output_tokens: maxTokens,
    temperature,
  }

  const result = await callOpenAI(apiKey, url, payload)
  console.log('[ZynoStep]', { model: result.meta.model, ms: result.meta.duration_ms })
  return result
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
    text: { format: { type: 'json_object' } },
    max_output_tokens: maxTokens,
    temperature,
  }

  const result = await callOpenAI(apiKey, url, payload)
  console.log('[ZynoEval]', { model: result.meta.model, ms: result.meta.duration_ms })
  return result
}
