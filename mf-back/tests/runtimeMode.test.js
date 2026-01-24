/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const {
  normalizeMode,
  ensureModeAllowed,
  registryCoverage,
} = require('../src/orchestration/runtimeMode');

const ORIGINAL_ENV = { ...process.env };

describe('runtimeMode helpers', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    jest.resetModules();
  });

  test('normalizeMode renvoie simulation par defaut', () => {
    expect(normalizeMode(undefined)).toBe('simulation');
    expect(normalizeMode('Demo')).toBe('demo');
    expect(normalizeMode('REAL')).toBe('real');
    expect(normalizeMode('unknown')).toBe('simulation');
  });

  test('ensureModeAllowed bloque mode real si env manquants', () => {
    process.env.OPENAI_API_KEY = '';
    process.env.RAG_SEARCH_URL = '';
    process.env.RAG_API_KEY = '';
    process.env.EXECUTION_ENABLED = 'false';

    const guard = ensureModeAllowed('real');
    expect(guard.allowed).toBe(false);
    expect(guard.issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining('OPENAI_API_KEY'),
        expect.stringContaining('EXECUTION_ENABLED'),
      ])
    );
  });

  test('ensureModeAllowed autorise mode real si env OK', () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.RAG_SEARCH_URL = 'https://rag.example/search';
    process.env.RAG_API_KEY = 'rag-key';
    process.env.EXECUTION_ENABLED = 'true';

    const guard = ensureModeAllowed('real');
    expect(guard.allowed).toBe(true);
    expect(guard.issues).toHaveLength(0);
    expect(guard.health.llm.hasKey).toBe(true);
    expect(guard.health.rag.remoteConfigured).toBe(true);
    expect(guard.health.rag.hasKey).toBe(true);
    expect(guard.health.execution.enabled).toBe(true);
  });

  test('registryCoverage reflete les overrides env pour les agents', () => {
    // RiskFraudAgent is enabled by default; we verify this, then force to false.
    delete process.env.AGENT_RISKFRAUDAGENT_ENABLED;
    let coverage = registryCoverage();
    const risk = coverage.intents.find((i) => i.intent === 'risk_fraud');
    expect(risk).toBeDefined();
    // Default enabled
    expect(risk.enabledAgents).toHaveLength(1);
    expect(risk.enabledAgents).toContain('RiskFraudAgent');

    // Force disable
    process.env.AGENT_RISKFRAUDAGENT_ENABLED = 'false';
    coverage = registryCoverage();
    const riskDisabled = coverage.intents.find((i) => i.intent === 'risk_fraud');
    expect(riskDisabled.enabledAgents).toHaveLength(0);
  });
});
