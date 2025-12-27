// Helper functions to reduce cognitive complexity
const buildDiagnostics = (proof, anchor, mint) => ({
  proof: {
    proofId: proof.proofId || null,
    hasHash: Boolean(proof.hash),
    hasSignature: Boolean(proof.signature),
    localOnly: proof.localOnly === true,
  },
  anchor: {
    status: anchor.status || null,
    txId: anchor.anchorTxId || null,
    network: anchor.network || null,
    mainnetAttempt: anchor.mainnetAttempt === true,
  },
  mint: {
    proofAnchored: mint.proofAnchored === true,
    mintTxId: mint.mintTxId || null,
    seed: mint.seed || null,
    authority: mint.authority || null,
  },
});

const validateProof = (proof) => {
  const hasProof = proof && Object.keys(proof).length > 0;
  if (!hasProof) return null;

  const missingProofId = !proof.proofId;
  const missingHash = !proof.hash && !proof.localOnly;
  const missingSignature = !proof.signature && !proof.localOnly;

  if (missingProofId || missingHash || missingSignature) {
    return 'web3_invalid_proof';
  }
  return null;
};

const validateAnchor = (anchor) => {
  const hasAnchor = anchor && Object.keys(anchor).length > 0;
  if (!hasAnchor) return null;

  const anchorFailed = anchor.status && String(anchor.status).toUpperCase() === 'FAILED';
  const anchorDouble = Boolean(anchor.anchorTxId);
  const anchorNetwork = anchor.network ? String(anchor.network).toUpperCase() : null;
  const anchorMainnet = anchor.mainnetAttempt === true;
  const invalidNetwork = anchorNetwork && anchorNetwork !== 'TESTNET';

  if (anchorFailed || anchorDouble || invalidNetwork || anchorMainnet) {
    return 'web3_anchor_guard';
  }
  return null;
};

const validateMint = (mint) => {
  const hasMint = mint && Object.keys(mint).length > 0;
  if (!hasMint) return null;

  const mintTx = Boolean(mint.mintTxId);
  const mintSeedMissing = !mint.seed;
  const mintProofMissing = mint.proofAnchored !== true;
  const mintAuthorityInvalid = mint.authority && String(mint.authority).toLowerCase() !== 'server';

  if (mintTx || mintSeedMissing || mintProofMissing || mintAuthorityInvalid) {
    return 'web3_mint_guard';
  }
  return null;
};

const determineGuardLevel = (reasons) => {
  const hasBlockingReason = reasons.some((r) => r.includes('web3_anchor_guard') || r.includes('web3_mint_guard'));
  if (hasBlockingReason) {
    return { level: 'BLOCK', allowed: false };
  }
  if (reasons.length > 0) {
    return { level: 'WARN', allowed: false };
  }
  return { level: 'OK', allowed: true };
};

function evaluate({ request = {}, payload = null, executionPlan = [] }) {
  const safePayload = payload || {};
  const web3 = safePayload.web3 || request.context?.web3 || {};
  const proof = web3.proof || {};
  const anchor = web3.anchor || {};
  const mint = web3.mint || {};

  const diagnostics = buildDiagnostics(proof, anchor, mint);
  const reasons = [];

  const proofReason = validateProof(proof);
  if (proofReason) reasons.push(proofReason);

  const anchorReason = validateAnchor(anchor);
  if (anchorReason) reasons.push(anchorReason);

  const mintReason = validateMint(mint);
  if (mintReason) reasons.push(mintReason);

  const { level, allowed } = determineGuardLevel(reasons);

  return {
    allowed,
    level,
    reasons,
    diagnostics,
  };
}

module.exports = {
  evaluate,
};
