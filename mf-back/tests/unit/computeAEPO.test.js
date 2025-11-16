const computeAEPO = require('../../metrics/computeAEPO');

describe('computeAEPO', () => {
  it('should return 100 for perfect run', () => {
    expect(computeAEPO({ duration: 100, success: true, retries: 0 })).toBe(100);
  });

  it('should apply duration penalty', () => {
    expect(computeAEPO({ duration: 40000, success: true, retries: 0 })).toBeLessThan(100);
  });

  it('should apply retry penalty', () => {
    expect(computeAEPO({ duration: 100, success: true, retries: 3 })).toBe(70);
  });

  it('should return 0 if failed', () => {
    expect(computeAEPO({ duration: 1000, success: false, retries: 1 })).toBe(0);
  });
});
