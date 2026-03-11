/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const workflowMap = require('../../src/orchestration/workflowMap');

describe('workflowMap journeys and phases', () => {
  it('covers cognitive-activation-hub journey with ordered phases', () => {
    const phases = Object.keys(workflowMap['cognitive-activation-hub'].phases);
    expect(phases).toEqual(expect.arrayContaining(['cognitive-orientation', 'solana-fluency', 'token-design-lab']));
    expect(workflowMap['cognitive-activation-hub'].phases['cognitive-orientation']).toBeDefined();
  });

  it('covers capital-foundry journey with ordered phases', () => {
    const phases = Object.keys(workflowMap['capital-foundry'].phases);
    expect(phases).toEqual(expect.arrayContaining(['capital-discovery', 'program-forge', 'capital-launchpad']));
    expect(workflowMap['capital-foundry'].phases['capital-discovery']).toBeDefined();
  });

  it('covers resilience-master journey with ordered phases', () => {
    const phases = Object.keys(workflowMap['resilience-master'].phases);
    expect(phases).toContain('risk-assessment');
    expect(workflowMap['resilience-master'].phases['risk-assessment']).toEqual(expect.arrayContaining(['risk_fraud', 'security_audit']));
  });
});
