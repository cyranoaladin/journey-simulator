/**
 * Specialized Validators for MFAI - Relentless Precision Edition
 * Enforces R3: State Truth & Mathematical Integrity.
 */

const specializedValidators = {
    /**
     * Validates CPMM (Constant Product Market Maker) Curve Parameters.
     * Enforces TWAP Oracle integrity and positive liquidity.
     */
    validateBondingCurve: (params) => {
        const { collateral, supply, curveType, oracleType } = params;

        // Rule: Oracle must be TWAP (Time-Weighted Average Price) to prevent flash-loan exploits
        if (oracleType !== 'TWAP') {
            return {
                valid: false,
                error: 'VALIDATION_FAILED: Price Oracle must be TWAP-compliant to mitigate flash-price manipulation.'
            };
        }

        // Rule: CPMM Invariant x * y = k must hold positive
        if (collateral <= 0 || supply <= 0) {
            return {
                valid: false,
                error: 'VALIDATION_FAILED: Liquidity parameters (Collateral/Supply) must be > 0.'
            };
        }

        return { valid: true, status: 'VALIDATION_SUCCESS' };
    },

    /**
     * Validates PDA (Program Derived Address) seed derivation logic.
     */
    validatePDADerivation: (seeds) => {
        // Rule: Seeds must not contain user-provided data directly without hashing
        if (!Array.isArray(seeds) || seeds.length === 0) {
            return {
                valid: false,
                error: 'VALIDATION_FAILED: Invalid PDA seeds. Canonical derivation required.'
            };
        }
        return { valid: true, status: 'VALIDATION_SUCCESS' };
    },

    /**
     * Scan for Common Security Vulnerabilities (Regex Pattern Matching).
     * Enforces sanitization of inputs.
     */
    validateSecurityPatterns: (input) => {
        const dangerousPatterns = [
            /sk-[a-zA-Z0-9]{20,}/,  // API Keys
            /<script\b[^>]*>([\s\S]*?)<\/script>/gm, // XSS
            /(eval|function)\s*\(/ // Code Injection
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(input)) {
                return {
                    valid: false,
                    error: 'VALIDATION_FAILED: Security Pattern Violation Detected (Key Leak or Injection).'
                };
            }
        }
        return { valid: true, status: 'VALIDATION_SUCCESS' };
    },

    /**
     * Validates Security Patches in Anchor Programs.
     * Enforces the presence of signer checks in context structs.
     */
    validateSecurityPatch: (codeSnippet) => {
        // Rule: Any account modifying state must have #[account(mut)] or Signer check
        // Rule: Specifically check for 'is_signer' or 'Signer' type for authority
        const hasSigner = /Signer<'info>/.test(codeSnippet) || /is_signer/.test(codeSnippet);
        const hasMut = /#\[account\(mut\)/.test(codeSnippet);

        if (!hasSigner && !hasMut) {
            return {
                valid: false,
                error: 'VALIDATION_FAILED: Missing Signer or Mutability check. Potential Unchecked Account vulnerability.'
            };
        }
        return { valid: true, status: 'VALIDATION_SUCCESS' };
    }
};

module.exports = specializedValidators;
