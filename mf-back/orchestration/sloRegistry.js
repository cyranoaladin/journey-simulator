const SLOS = [
  {
    id: 'orchestration_latency_p95',
    description: 'Latence p95 de /orchestration/vslice',
    target: 500, // ms
    window: 100, // derniers runs
    severity: 'WARN',
  },
  {
    id: 'status_warn_rate',
    description: 'Taux de runs WARN',
    target: 0.2, // 20%
    window: 100,
    severity: 'INFO',
  },
  {
    id: 'status_fail_timeout_rate',
    description: 'Taux de runs FAIL ou TIMEOUT',
    target: 0.05, // 5%
    window: 100,
    severity: 'CRITICAL',
  },
  {
    id: 'idempotent_replay_rate',
    description: 'Taux de replays idempotents',
    target: 0.1,
    window: 100,
    severity: 'INFO',
  },
  {
    id: 'dry_run_rate',
    description: 'Taux de runs en DRY_RUN',
    target: 0.95, // attendu élevé par défaut
    window: 100,
    severity: 'INFO',
  },
  {
    id: 'agents_disabled_rate',
    description: 'Part des agents désactivés sur la sélection',
    target: 0.2,
    window: 100,
    severity: 'WARN',
  },
  {
    id: 'rag_usage_rate',
    description: 'Taux de runs avec RAG actif',
    target: 0.5,
    window: 100,
    severity: 'INFO',
  },
  {
    id: 'llm_usage_rate',
    description: 'Taux de runs avec LLM réel (non mock)',
    target: 0.5,
    window: 100,
    severity: 'INFO',
  },
  {
    id: 'real_block_rate',
    description: 'Taux de tentatives REAL bloquées par guards',
    target: 0.1,
    window: 100,
    severity: 'WARN',
  },
  {
    id: 'llm_cost_per_run',
    description: 'Coût LLM estimé par run',
    target: 0.05, // USD
    window: 100,
    severity: 'WARN',
  },
  {
    id: 'llm_calls_per_run',
    description: 'Appels LLM par run',
    target: 10,
    window: 100,
    severity: 'INFO',
  },
  {
    id: 'circuit_breaker_open_rate',
    description: 'Taux de runs avec circuit breaker ouvert',
    target: 0.1,
    window: 100,
    severity: 'WARN',
  },
  {
    id: 'queue_shed_rate',
    description: 'Taux de sheds concurrency',
    target: 0.05,
    window: 100,
    severity: 'WARN',
  },
  {
    id: 'cold_start_rate',
    description: 'Taux de cold start',
    target: 0.2,
    window: 50,
    severity: 'INFO',
  },
];

function listSLOs() {
  return SLOS;
}

module.exports = {
  listSLOs,
};
