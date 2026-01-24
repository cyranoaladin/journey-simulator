const specializedValidators = require('@mocks/orchestration').specializedValidators;

describe('Specialized Validators (Unit Blitz)', () => {

    describe('validateBondingCurve (Math Integrity)', () => {
        it('should pass for valid TWAP and positive liquidity', () => {
            const result = specializedValidators.validateBondingCurve({
                collateral: 1000,
                supply: 5000,
                curveType: 'exponential',
                oracleType: 'TWAP'
            });
            expect(result.valid).toBe(true);
            expect(result.status).toBe('VALIDATION_SUCCESS');
        });

        it('should fail if Oracle is not TWAP', () => {
            const result = specializedValidators.validateBondingCurve({
                collateral: 1000,
                supply: 5000,
                curveType: 'exponential',
                oracleType: 'SPOT'
            });
            expect(result.valid).toBe(false);
            expect(result.error).toContain('TWAP-compliant');
        });

        it('should fail for negative collateral', () => {
            const result = specializedValidators.validateBondingCurve({
                collateral: -50,
                supply: 5000,
                curveType: 'exponential',
                oracleType: 'TWAP'
            });
            expect(result.valid).toBe(false);
            expect(result.error).toContain('must be > 0');
        });
    });

    describe('validateSecurityPatterns (Regex Audit)', () => {
        it('should detect API Key leaks', () => {
            const input = "Here is my key: sk-123456789012345678901234";
            const result = specializedValidators.validateSecurityPatterns(input);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Security Pattern Violation');
        });

        it('should detect XSS scripts', () => {
            const input = "Hello <script>alert(1)</script>";
            const result = specializedValidators.validateSecurityPatterns(input);
            expect(result.valid).toBe(false);
        });

        it('should pass safe input', () => {
            const input = "Just some harmless text.";
            const result = specializedValidators.validateSecurityPatterns(input);
            expect(result.valid).toBe(true);
        });
    });

    describe('validatePDADerivation', () => {
        it('should fail if seeds are empty', () => {
            const result = specializedValidators.validatePDADerivation([]);
            expect(result.valid).toBe(false);
        });

        it('should pass valid seeds array', () => {
            const result = specializedValidators.validatePDADerivation(['seed1', 'seed2']);
            expect(result.valid).toBe(true);
        });
    });

    // --- DEEP AUDIT TRANSIENT CHECKS ---
    describe('validateBondingCurve (0-Price Check)', () => {
        it('should reject 0 collateral (Transient Check)', () => {
            const result = specializedValidators.validateBondingCurve({
                collateral: 0,
                supply: 5000,
                curveType: 'exponential',
                oracleType: 'TWAP'
            });
            expect(result.valid).toBe(false);
            expect(result.error).toContain('must be > 0');
        });
    });

    describe('validateSecurityPatch (Code Auditor Logic)', () => {
        it('should catch missing signer check', () => {
            const insecureCode = `pub struct Withdraw<'info> { pub user: AccountInfo<'info>, }`;
            const result = specializedValidators.validateSecurityPatch(insecureCode);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Missing Signer');
        });

        it('should pass code with Signer', () => {
            const secureCode = `pub struct Withdraw<'info> { pub authority: Signer<'info>, }`;
            const result = specializedValidators.validateSecurityPatch(secureCode);
            expect(result.valid).toBe(true);
        });
    });
});
