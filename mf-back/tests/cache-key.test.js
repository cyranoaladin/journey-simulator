/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { generateIdempotencyKey } = require('@mocks/utils');

describe('Agent Idempotency Key - Cache Bug Fix', () => {
    describe('Test A — Different prompts generate different keys (MISS expected)', () => {
        it('should generate different keys for different prompts with same context', () => {
            const key1 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', {
                userId: 'user1',
                userPrompt: 'PROMPT_A_UNIQUE_CACHE_MISS_TEST'
            });

            const key2 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', {
                userId: 'user1',
                userPrompt: 'PROMPT_B_AUTRE_UNIQUE_DIFFERENT'
            });

            expect(key1).not.toBe(key2);
            expect(key1).toBeTruthy();
            expect(key2).toBeTruthy();
        });

        it('should generate different keys for prompts with minor variations', () => {
            const key1 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', {
                userId: 'user1',
                userPrompt: 'Explain staking'
            });

            const key2 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', {
                userId: 'user1',
                userPrompt: 'Explain minting'
            });

            expect(key1).not.toBe(key2);
        });
    });

    describe('Test B — Same prompt generates same key (HIT expected)', () => {
        it('should generate identical keys for identical prompts', () => {
            const key1 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', {
                userId: 'user1',
                userPrompt: 'PROMPT_A_UNIQUE_CACHE_MISS_TEST'
            });

            const key2 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', {
                userId: 'user1',
                userPrompt: 'PROMPT_A_UNIQUE_CACHE_MISS_TEST'
            });

            expect(key1).toBe(key2);
        });

        it('should generate same key for same prompt called multiple times', () => {
            const context = {
                userId: 'user1',
                userPrompt: 'What is my roadmap?'
            };

            const key1 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', context);
            const key2 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', context);
            const key3 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', context);

            expect(key1).toBe(key2);
            expect(key2).toBe(key3);
        });
    });

    describe('Test C — Multi-tenant safety (no cross-user contamination)', () => {
        it('should generate different keys for different users with same prompt', () => {
            const key1 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', {
                userId: 'user1',
                userPrompt: 'PROMPT_A_UNIQUE_CACHE_MISS_TEST'
            });

            const key2 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', {
                userId: 'user2',
                userPrompt: 'PROMPT_A_UNIQUE_CACHE_MISS_TEST'
            });

            expect(key1).not.toBe(key2);
        });

        it('should isolate cache between different journeys', () => {
            const key1 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', {
                userId: 'user1',
                userPrompt: 'PROMPT_A'
            });

            const key2 = generateIdempotencyKey('journey2', 'phase1', 'CoachAgent', {
                userId: 'user1',
                userPrompt: 'PROMPT_A'
            });

            expect(key1).not.toBe(key2);
        });

        it('should isolate cache between different phases', () => {
            const key1 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', {
                userId: 'user1',
                userPrompt: 'PROMPT_A'
            });

            const key2 = generateIdempotencyKey('journey1', 'phase2', 'CoachAgent', {
                userId: 'user1',
                userPrompt: 'PROMPT_A'
            });

            expect(key1).not.toBe(key2);
        });

        it('should isolate cache between different agents', () => {
            const key1 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', {
                userId: 'user1',
                userPrompt: 'PROMPT_A'
            });

            const key2 = generateIdempotencyKey('journey1', 'phase1', 'PitchAgent', {
                userId: 'user1',
                userPrompt: 'PROMPT_A'
            });

            expect(key1).not.toBe(key2);
        });
    });

    describe('Edge cases', () => {
        it('should handle missing userPrompt gracefully', () => {
            const key1 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', {
                userId: 'user1'
            });

            const key2 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', {
                userId: 'user1',
                userPrompt: undefined
            });

            expect(key1).toBe(key2);
            expect(key1).toBeTruthy();
        });

        it('should handle empty string prompt', () => {
            const key1 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', {
                userId: 'user1',
                userPrompt: ''
            });

            const key2 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', {
                userId: 'user1',
                userPrompt: 'non-empty'
            });

            expect(key1).not.toBe(key2);
        });

        it('should generate deterministic hash for same prompt', () => {
            const key1 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', {
                userId: 'user1',
                userPrompt: 'Test prompt with special chars: @#$%^&*()'
            });

            const key2 = generateIdempotencyKey('journey1', 'phase1', 'CoachAgent', {
                userId: 'user1',
                userPrompt: 'Test prompt with special chars: @#$%^&*()'
            });

            expect(key1).toBe(key2);
        });
    });
});
