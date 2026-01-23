/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const web3Pipeline = require('../../orchestration/web3Pipeline');

describe('web3Pipeline', () => {
  beforeEach(() => {
    web3Pipeline.reset({ tenantId: 'test-tenant', runId: 'test-run' });
    web3Pipeline.reset({ tenantId: 'test-tenant-2', runId: 'test-run' });
  });

  describe('getState', () => {
    it('returns NONE state for new run', () => {
      const state = web3Pipeline.getState({ tenantId: 'test-tenant', runId: 'new-run' });
      expect(state.state).toBe('NONE');
      expect(state.proof).toBeNull();
      expect(state.anchor).toBeNull();
      expect(state.mint).toBeNull();
      expect(state.history).toEqual([]);
    });
  });

  describe('applyAction - proof', () => {
    it('creates proof from NONE state', () => {
      const result = web3Pipeline.applyAction('proof', { tenantId: 'test-tenant', runId: 'test-run' });
      expect(result.success).toBe(true);
      expect(result.state).toBe('PROOF_CREATED');
      expect(result.proof).toBeDefined();
      expect(result.proof.hash).toBeDefined();
      expect(result.proof.createdAt).toBeDefined();
      expect(result.history).toHaveLength(1);
      expect(result.history[0].action).toBe('proof');
    });

    it('is idempotent when proof already exists', () => {
      web3Pipeline.applyAction('proof', { tenantId: 'test-tenant', runId: 'test-run' });
      const result = web3Pipeline.applyAction('proof', { tenantId: 'test-tenant', runId: 'test-run' });
      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(true);
      expect(result.state).toBe('PROOF_CREATED');
    });

    it('fails from invalid state', () => {
      web3Pipeline.applyAction('proof', { tenantId: 'test-tenant', runId: 'test-run' });
      web3Pipeline.applyAction('anchor', { tenantId: 'test-tenant', runId: 'test-run' });
      const result = web3Pipeline.applyAction('proof', { tenantId: 'test-tenant', runId: 'test-run' });
      expect(result.success).toBe(false);
      expect(result.level).toBe('WARN');
      expect(result.reason).toBe('invalid_web3_transition');
      expect(result.expected).toBe('NONE');
      expect(result.actual).toBe('ANCHOR_CREATED');
    });
  });

  describe('applyAction - anchor', () => {
    it('creates anchor from PROOF_CREATED state', () => {
      web3Pipeline.applyAction('proof', { tenantId: 'test-tenant', runId: 'test-run' });
      const result = web3Pipeline.applyAction('anchor', { tenantId: 'test-tenant', runId: 'test-run' });
      expect(result.success).toBe(true);
      expect(result.state).toBe('ANCHOR_CREATED');
      expect(result.anchor).toBeDefined();
      expect(result.anchor.anchorId).toBeDefined();
      expect(result.anchor.status).toBe('CONFIRMED');
      expect(result.history).toHaveLength(2);
      expect(result.history[1].action).toBe('anchor');
    });

    it('fails without proof', () => {
      const result = web3Pipeline.applyAction('anchor', { tenantId: 'test-tenant', runId: 'test-run' });
      expect(result.success).toBe(false);
      expect(result.reason).toBe('invalid_web3_transition');
      expect(result.expected).toBe('PROOF_CREATED');
      expect(result.actual).toBe('NONE');
    });

    it('is idempotent when anchor already exists', () => {
      web3Pipeline.applyAction('proof', { tenantId: 'test-tenant', runId: 'test-run' });
      web3Pipeline.applyAction('anchor', { tenantId: 'test-tenant', runId: 'test-run' });
      const result = web3Pipeline.applyAction('anchor', { tenantId: 'test-tenant', runId: 'test-run' });
      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(true);
      expect(result.state).toBe('ANCHOR_CREATED');
    });
  });

  describe('applyAction - mint', () => {
    it('creates mint from ANCHOR_CREATED state', () => {
      web3Pipeline.applyAction('proof', { tenantId: 'test-tenant', runId: 'test-run' });
      web3Pipeline.applyAction('anchor', { tenantId: 'test-tenant', runId: 'test-run' });
      const result = web3Pipeline.applyAction('mint', { tenantId: 'test-tenant', runId: 'test-run' });
      expect(result.success).toBe(true);
      expect(result.state).toBe('MINT_READY');
      expect(result.mint).toBeDefined();
      expect(result.mint.tokenId).toBeDefined();
      expect(result.mint.status).toBe('READY');
      expect(result.history).toHaveLength(3);
      expect(result.history[2].action).toBe('mint');
    });

    it('fails without anchor', () => {
      const result = web3Pipeline.applyAction('mint', { tenantId: 'test-tenant', runId: 'test-run' });
      expect(result.success).toBe(false);
      expect(result.reason).toBe('invalid_web3_transition');
      expect(result.expected).toBe('ANCHOR_CREATED');
      expect(result.actual).toBe('NONE');
    });

    it('is idempotent when mint already exists', () => {
      web3Pipeline.applyAction('proof', { tenantId: 'test-tenant', runId: 'test-run' });
      web3Pipeline.applyAction('anchor', { tenantId: 'test-tenant', runId: 'test-run' });
      web3Pipeline.applyAction('mint', { tenantId: 'test-tenant', runId: 'test-run' });
      const result = web3Pipeline.applyAction('mint', { tenantId: 'test-tenant', runId: 'test-run' });
      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(true);
      expect(result.state).toBe('MINT_READY');
    });
  });

  describe('happy path - full pipeline', () => {
    it('completes proof → anchor → mint sequence', () => {
      const proof = web3Pipeline.applyAction('proof', { tenantId: 'test-tenant', runId: 'test-run' });
      expect(proof.state).toBe('PROOF_CREATED');

      const anchor = web3Pipeline.applyAction('anchor', { tenantId: 'test-tenant', runId: 'test-run' });
      expect(anchor.state).toBe('ANCHOR_CREATED');

      const mint = web3Pipeline.applyAction('mint', { tenantId: 'test-tenant', runId: 'test-run' });
      expect(mint.state).toBe('MINT_READY');

      const final = web3Pipeline.getState({ tenantId: 'test-tenant', runId: 'test-run' });
      expect(final.state).toBe('MINT_READY');
      expect(final.proof).toBeDefined();
      expect(final.anchor).toBeDefined();
      expect(final.mint).toBeDefined();
      expect(final.history).toHaveLength(3);
    });
  });

  describe('tenant isolation', () => {
    it('isolates state per tenant', () => {
      web3Pipeline.applyAction('proof', { tenantId: 'test-tenant', runId: 'test-run' });
      const state1 = web3Pipeline.getState({ tenantId: 'test-tenant', runId: 'test-run' });
      const state2 = web3Pipeline.getState({ tenantId: 'test-tenant-2', runId: 'test-run' });
      expect(state1.state).toBe('PROOF_CREATED');
      expect(state2.state).toBe('NONE');
    });
  });

  describe('snapshot', () => {
    it('returns same state as getState', () => {
      web3Pipeline.applyAction('proof', { tenantId: 'test-tenant', runId: 'test-run' });
      const snapshot = web3Pipeline.snapshot({ tenantId: 'test-tenant', runId: 'test-run' });
      const state = web3Pipeline.getState({ tenantId: 'test-tenant', runId: 'test-run' });
      expect(snapshot).toEqual(state);
    });
  });

  describe('reset', () => {
    it('clears state for test', () => {
      web3Pipeline.applyAction('proof', { tenantId: 'test-tenant', runId: 'test-run' });
      web3Pipeline.reset({ tenantId: 'test-tenant', runId: 'test-run' });
      const state = web3Pipeline.getState({ tenantId: 'test-tenant', runId: 'test-run' });
      expect(state.state).toBe('NONE');
    });
  });

  describe('deterministic hashes', () => {
    it('generates same hash for same runId and tenant', () => {
      const result1 = web3Pipeline.applyAction('proof', { tenantId: 'test-tenant', runId: 'test-run' });
      web3Pipeline.reset({ tenantId: 'test-tenant', runId: 'test-run' });
      const result2 = web3Pipeline.applyAction('proof', { tenantId: 'test-tenant', runId: 'test-run' });
      expect(result1.proof.hash).toBe(result2.proof.hash);
    });

    it('generates different hash for different runId', () => {
      const result1 = web3Pipeline.applyAction('proof', { tenantId: 'test-tenant', runId: 'test-run-1' });
      const result2 = web3Pipeline.applyAction('proof', { tenantId: 'test-tenant', runId: 'test-run-2' });
      expect(result1.proof.hash).not.toBe(result2.proof.hash);
    });
  });
});
