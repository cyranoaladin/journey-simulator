import { describe, it, expect } from 'vitest';
import { sanitizeHeaders } from '../sanitizeHeaders';

describe('sanitizeHeaders', () => {
    it('should redact authorization header (case-insensitive)', () => {
        const input = {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            'content-type': 'application/json'
        };

        const result = sanitizeHeaders(input);

        expect(result['Authorization']).toBe('[REDACTED]');
        expect(result['content-type']).toBe('application/json');
    });

    it('should redact x-api-key header', () => {
        const input = {
            'x-api-key': 'admin-secret',
            'x-run-mode': 'real'
        };

        const result = sanitizeHeaders(input);

        expect(result['x-api-key']).toBe('[REDACTED]');
        expect(result['x-run-mode']).toBe('real');
    });

    it('should redact cookie and set-cookie headers', () => {
        const input = {
            'cookie': 'session=abc123; token=xyz789',
            'set-cookie': 'session=new; HttpOnly'
        };

        const result = sanitizeHeaders(input);

        expect(result['cookie']).toBe('[REDACTED]');
        expect(result['set-cookie']).toBe('[REDACTED]');
    });

    it('should redact OIDC tokens (id-token, x-id-token)', () => {
        const input = {
            'id-token': 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
            'x-id-token': 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
        };

        const result = sanitizeHeaders(input);

        expect(result['id-token']).toBe('[REDACTED]');
        expect(result['x-id-token']).toBe('[REDACTED]');
    });

    it('should redact proxy-authorization header', () => {
        const input = {
            'proxy-authorization': 'Basic dXNlcjpwYXNz',
            'host': 'example.com'
        };

        const result = sanitizeHeaders(input);

        expect(result['proxy-authorization']).toBe('[REDACTED]');
        expect(result['host']).toBe('example.com');
    });

    it('should handle array values (e.g., set-cookie)', () => {
        const input = {
            'set-cookie': ['session=abc; HttpOnly', 'token=xyz; Secure']
        };

        const result = sanitizeHeaders(input);

        expect(result['set-cookie']).toEqual(['[REDACTED]', '[REDACTED]']);
    });

    it('should apply pattern-based safety net for Bearer tokens in custom headers', () => {
        const input = {
            'x-debug': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
            'x-trace-id': '123456'
        };

        const result = sanitizeHeaders(input);

        expect(result['x-debug']).toBe('[REDACTED]'); // Bearer detected
        expect(result['x-trace-id']).toBe('123456');
    });

    it('should apply pattern-based safety net for JWT-like values in custom headers', () => {
        const input = {
            'x-custom': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
            'x-request-id': 'req-123'
        };

        const result = sanitizeHeaders(input);

        expect(result['x-custom']).toBe('[REDACTED]'); // JWT pattern detected
        expect(result['x-request-id']).toBe('req-123');
    });

    it('should not mutate input object', () => {
        const input = {
            'authorization': 'Bearer token123',
            'content-type': 'application/json'
        };

        const inputCopy = { ...input };
        sanitizeHeaders(input);

        expect(input).toEqual(inputCopy); // Original unchanged
    });

    it('should handle undefined values gracefully', () => {
        const input = {
            'authorization': 'Bearer token123',
            'x-optional': undefined
        };

        const result = sanitizeHeaders(input);

        expect(result['authorization']).toBe('[REDACTED]');
        expect(result['x-optional']).toBeUndefined();
    });

    it('should preserve original key casing', () => {
        const input = {
            'Authorization': 'Bearer token123',
            'X-API-Key': 'secret'
        };

        const result = sanitizeHeaders(input);

        expect(Object.keys(result)).toContain('Authorization');
        expect(Object.keys(result)).toContain('X-API-Key');
    });
});
