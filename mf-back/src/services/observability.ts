/**
 * @file observability.ts
 * @description Intégration LangFuse pour le tracing des agents IA MFAI.
 *
 * MODE FAIL-SAFE : si LANGFUSE_SECRET_KEY n'est pas configuré,
 * toutes les fonctions retournent immédiatement sans erreur.
 * Le tracing est entièrement optionnel et non-bloquant.
 *
 * Pour activer : configurer LANGFUSE_SECRET_KEY + LANGFUSE_PUBLIC_KEY dans .env
 * Dashboard gratuit : https://cloud.langfuse.com (50k traces/mois free tier)
 *
 * @author Kimi Code CLI — 2026-03-11
 */

import Langfuse from 'langfuse';

// ─── Initialisation conditionnelle ─────────────────────────────────────────

const isEnabled =
  !!process.env.LANGFUSE_SECRET_KEY &&
  !!process.env.LANGFUSE_PUBLIC_KEY &&
  process.env.LANGFUSE_ENABLED !== 'false';

let client: Langfuse | null = null;

if (isEnabled) {
  try {
    client = new Langfuse({
      secretKey: process.env.LANGFUSE_SECRET_KEY!,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
      baseUrl: process.env.LANGFUSE_BASE_URL ?? 'https://cloud.langfuse.com',
      flushAt: 20,
      flushInterval: 10_000,
    });
    console.info('[Observability] ✅ LangFuse activé — tracing agents activé');
  } catch (err) {
    console.warn('[Observability] LangFuse init failed (non-bloquant):', err);
    client = null;
  }
} else {
  console.info('[Observability] LangFuse désactivé — définir LANGFUSE_SECRET_KEY + LANGFUSE_PUBLIC_KEY pour activer');
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TraceContext {
  userId?: string;
  journeyId?: string;
  sessionId?: string;
  persona?: string;
  tags?: string[];
}

export interface AgentObservation {
  agentName: string;
  agentVersion?: string;
  model: string;
  taskType?: string;
  input: unknown;
  output: unknown;
  durationMs: number;
  success: boolean;
  error?: string;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
  /** Coût estimé en USD (si calculable) */
  estimatedCostUsd?: number;
}

// ─── API publique ────────────────────────────────────────────────────────────

/**
 * Trace une exécution d'agent dans LangFuse.
 * Opération 100% non-bloquante — ne lève jamais d'exception.
 */
export async function traceAgentRun(
  context: TraceContext,
  observation: AgentObservation
): Promise<void> {
  if (!client) return; // Fail-safe : rien à faire si non configuré

  try {
    const startTime = new Date(Date.now() - observation.durationMs);
    const endTime = new Date();

    const trace = client.trace({
      name: `agent:${observation.agentName}`,
      userId: context.userId,
      sessionId: context.sessionId ?? context.journeyId,
      tags: [
        ...(context.tags ?? []),
        `persona:${context.persona ?? 'unknown'}`,
        `agent:${observation.agentName}`,
        `model:${observation.model}`,
        observation.success ? 'success' : 'failure',
      ],
      metadata: {
        journeyId: context.journeyId,
        agentVersion: observation.agentVersion ?? 'v1',
        taskType: observation.taskType,
      },
    });

    trace.generation({
      name: `${observation.agentName}:run`,
      model: observation.model,
      input: observation.input,
      output: observation.output,
      startTime,
      endTime,
      usage: observation.tokensUsed
        ? {
            promptTokens: observation.tokensUsed.prompt,
            completionTokens: observation.tokensUsed.completion,
            totalTokens: observation.tokensUsed.total,
          }
        : undefined,
      statusMessage: observation.error ?? 'success',
      level: observation.error ? 'ERROR' : 'DEFAULT',
      metadata: { estimatedCostUsd: observation.estimatedCostUsd },
    });

    // Flush asynchrone — ne jamais attendre en production
    client.flushAsync().catch(() => {}); // Intentionnellement silencieux
  } catch (err) {
    // Jamais propager l'erreur LangFuse — l'observabilité ne doit pas casser le produit
    console.warn('[Observability] traceAgentRun failed (non-bloquant):', err);
  }
}

/**
 * Trace un score AEPO dans LangFuse pour analyse de la qualité des évaluations.
 */
export async function traceAEPOScore(
  context: TraceContext,
  score: { global: number; dimensions: Record<string, number> }
): Promise<void> {
  if (!client) return;

  try {
    const trace = client.trace({
      name: 'aepo:score',
      userId: context.userId,
      sessionId: context.journeyId,
      tags: ['aepo', `score:${Math.round(score.global / 10) * 10}`], // Arrondi à la dizaine pour groupement
      metadata: { ...score, journeyId: context.journeyId },
    });

    // Enregistrer comme score LangFuse pour analyse statistique
    trace.score({
      name: 'aepo_global_score',
      value: score.global / 100, // LangFuse attend une valeur entre 0 et 1
      comment: `Dimensions: ${JSON.stringify(score.dimensions)}`,
    });

    client.flushAsync().catch(() => {});
  } catch (err) {
    console.warn('[Observability] traceAEPOScore failed:', err);
  }
}

/**
 * Vérifie si LangFuse est configuré et opérationnel.
 */
export function isObservabilityEnabled(): boolean {
  return client !== null;
}

export default { traceAgentRun, traceAEPOScore, isObservabilityEnabled };
