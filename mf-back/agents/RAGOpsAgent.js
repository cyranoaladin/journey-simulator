class RAGOpsAgent {
  constructor() {
    this.id = 'RAGOpsAgent';
  }

  async run(request = {}) {
    const started = Date.now();
    try {
      const { traceId, intentNormalized, input = '', journey = {}, ragContext } = request;
      const journeyType = journey?.journeyType || 'generic';
      const phaseId = journey?.phaseId || journey?.phases?.[0] || 'unspecified';
      const objectives = journey?.objectives || [];
      const artifacts = journey?.artifacts || [];
      const hasInput = Boolean(input && input.trim());
      const rawChunks = Array.isArray(ragContext?.chunks) ? ragContext.chunks.slice(0, 3) : [];
      const citations = rawChunks.map((c) => ({
        id: c.id,
        title: c.title,
        source: c.source,
        file_path: c.file_path || c.path || c.doc_id || null,
        score: typeof c.score === 'number' ? c.score : (typeof c.similarity === 'number' ? c.similarity : 0.5),
      }));
      const hasCitations = citations.length > 0;
      const avgScore = citations.length
        ? citations.reduce((acc, c) => acc + (typeof c.score === 'number' ? c.score : 0), 0) / citations.length
        : 0;
      const insufficientContext = !hasCitations || avgScore < 0.6;

      const summary = !hasCitations
        ? 'RAG grounding missing — strict grounding enforced'
        : hasInput
          ? 'RAG pipeline checks generated'
          : 'RAG pipeline checks drafted with limited input';
      const confidence = insufficientContext ? Math.min(avgScore, 0.5) : Math.max(0.6, Math.min(avgScore, 0.9));
      const findings = [
        { item: 'grounding', status: insufficientContext ? 'fail' : 'ok', detail: hasCitations ? 'Citations provided' : 'No RAG citations supplied — cannot answer reliably' },
        { item: 'ingestion', status: insufficientContext ? 'warn' : 'ok', detail: 'Ingestion schedule/checks listed' },
        { item: 'relevance', status: insufficientContext ? 'fail' : 'ok', detail: insufficientContext ? 'Average score below 0.6' : 'TopK sampling ready' },
        { item: 'pii', status: 'ok', detail: 'PII/retention controls noted' },
      ];

      const details = {
        intent: intentNormalized || 'rag_ops',
        journeyType,
        phaseId,
        objectives,
        artifacts,
        rag: {
          hits: citations.length,
          source: ragContext?.source || 'unknown',
          grounding: hasCitations ? 'strict_grounded' : 'missing',
          avgScore,
        },
        checks: [
          'Ingestion schedule and format validation',
          'Index freshness and topK relevance sampling',
          'PII stripping and retention policy',
        ],
      };

      const actions = insufficientContext
        ? ['Charger un document local pertinent', 'Relancer la requête après ingestion', 'Option: autoriser une recherche web']
        : [
          'Validate embedding pipeline and batch size',
          'Run relevance sampling on latest index',
          'Publish RAG observability dashboard (latency/hit rate)',
        ];

      if (insufficientContext) {
        if (process.env.NODE_ENV !== 'test') {
          // Observability: log low-confidence grounding to avoid silent hallucinations
          // eslint-disable-next-line no-console
          console.warn('[RAGOpsAgent] Insufficient RAG context', {
            hits: citations.length,
            avgScore,
            source: ragContext?.source || 'unknown'
          });
        }
        return {
          agentId: this.id,
          status: 'FAIL',
          summary: 'Information insuffisante dans la base de connaissance MFAI. Voulez-vous que je fasse une recherche web ou que vous chargiez un document ?',
          details,
          findings,
          confidence,
          assumptions: ['Strict grounding: refus de répondre sans contexte ≥ 0.6'],
          actions,
          citations,
          metrics: { latencyMs: Date.now() - started, ragHits: citations.length, avgScore },
          errors: ['insufficient_rag_context'],
          traceId,
        };
      }

      return {
        agentId: this.id,
        status: hasCitations ? (hasInput ? 'OK' : 'WARN') : 'FAIL',
        summary,
        details,
        findings,
        confidence,
        assumptions: citations.length ? [] : ['Aucune citation fournie — fournir des chunks RAG ou refuser de répondre'],
        actions,
        citations,
        metrics: { latencyMs: Date.now() - started, ragHits: citations.length },
        errors: hasCitations ? (hasInput ? [] : ['missing_input']) : ['missing_rag_grounding'],
        traceId,
      };
    } catch (error) {
      return {
        agentId: this.id,
        status: 'FAIL',
        summary: 'RAG ops agent failed',
        actions: [],
        citations: [],
        metrics: { latencyMs: Date.now() - started },
        errors: [error.message],
        traceId: request?.traceId,
      };
    }
  }
}

module.exports = RAGOpsAgent;
