/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const workflowMap = require('@mocks/orchestration').workflowMap;

describe('workflowMap journeys and phases', () => {
  it('covers product_launch journey with ordered phases', () => {
    const phases = Object.keys(workflowMap.product_launch.phases);
    expect(phases).toEqual(['discovery', 'design', 'validation', 'execution']);
    expect(workflowMap.product_launch.phases.discovery).toEqual(expect.arrayContaining(['product_spec']));
  });

  it('covers dao_readiness journey with ordered phases', () => {
    const phases = Object.keys(workflowMap.dao_readiness.phases);
    expect(phases).toEqual(['discovery', 'validation', 'audit']);
    expect(workflowMap.dao_readiness.phases.audit).toEqual(expect.arrayContaining(['risk_fraud']));
  });

  it('covers investor_fundraise journey with ordered phases', () => {
    const phases = Object.keys(workflowMap.investor_fundraise.phases);
    expect(phases).toEqual(['discovery', 'validation', 'execution']);
    expect(workflowMap.investor_fundraise.phases.execution).toEqual(expect.arrayContaining(['product_spec']));
  });
});
