'use strict';

const SNIPPET_PREVIEW_LENGTH = 320;

function normalizeSnippets(snippets = []) {
  if (!Array.isArray(snippets)) {
    return [];
  }

  return snippets.map((snippet, index) => {
    if (snippet && typeof snippet === 'object') {
      const previewSource =
        snippet.snippet ||
        snippet.excerpt ||
        snippet.summary ||
        (typeof snippet.content === 'string' ? snippet.content : undefined);

      return {
        title: snippet.title || snippet.name || `Source ${index + 1}`,
        url: snippet.url || snippet.link || null,
        snippet:
          typeof previewSource === 'string'
            ? previewSource.slice(0, SNIPPET_PREVIEW_LENGTH)
            : undefined,
        content:
          typeof snippet.content === 'string'
            ? snippet.content.slice(0, SNIPPET_PREVIEW_LENGTH)
            : undefined,
        score: snippet.score ?? snippet.similarity ?? undefined,
      };
    }

    if (typeof snippet === 'string') {
      return {
        title: `Source ${index + 1}`,
        snippet: snippet.slice(0, SNIPPET_PREVIEW_LENGTH),
      };
    }

    return {
      title: `Source ${index + 1}`,
    };
  });
}

function buildPrompt(agentName, objective) {
  if (!objective) {
    return `Analyse de mission orchestree par ${agentName}`;
  }

  return `${agentName} doit analyser la mission suivante : "${objective}".`;
}

function createAgentResponse(agentName, options = {}) {
  const phase = options.phase ?? null;
  const intent = options.intent ?? null;
  const objective = options.objective ?? null;
  const prompt = options.prompt ?? buildPrompt(agentName, objective);
  const sources = normalizeSnippets(options.snippets ?? options.sources ?? []);
  const summary = options.summary ?? options.ae_summary ?? null;
  const outcome = options.outcome ?? options.ae_outcome ?? null;
  const reasoning = options.reasoning ?? summary ?? null;
  const action = options.action ?? outcome ?? null;

  const metricsBase = {
    success: true,
    confidence: 0.8,
  };

  const metrics = {
    ...metricsBase,
    ...(options.metrics || {}),
  };

  if (typeof options.success === 'boolean') {
    metrics.success = options.success;
  }

  if (typeof options.confidence === 'number') {
    metrics.confidence = options.confidence;
  }

  const responsePayload = options.response ?? options.payload ?? null;

  const result = {
    agent: agentName,
    phase,
    intent,
    objective,
    prompt,
    reasoning,
    action,
    ae_summary: summary,
    ae_outcome: outcome,
    sources,
    references: sources,
    ragEnriched: sources,
    payload: options.payload ?? null,
    response: responsePayload,
    metrics,
    activationLevel: options.activationLevel ?? metrics.confidence ?? 0.8,
  };

  if (Array.isArray(options.ingestedDocuments)) {
    result.ingestedDocuments = options.ingestedDocuments;
  }

  if (options.notes) {
    result.notes = options.notes;
  }

  if (options.metadata && typeof options.metadata === 'object') {
    result.metadata = options.metadata;
  } else {
    result.metadata = {
      objective,
      userId: options.user?.id ?? options.user?.userId ?? null,
      persona: options.persona ?? null,
    };
  }

  return result;
}

module.exports = {
  createAgentResponse,
  normalizeSnippets,
};
