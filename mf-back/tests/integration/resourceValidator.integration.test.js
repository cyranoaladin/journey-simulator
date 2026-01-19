/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

jest.mock('axios', () => ({
    head: jest.fn((url) => {
        if (
            url.includes('solana.com')
        ) {
            return Promise.resolve({ status: 200 });
        }

        return Promise.reject(new Error('Network Error'));
    }),
    get: jest.fn(() => Promise.reject(new Error('Network Error')))
}));

const request = require('supertest');
const express = require('express');
const { validateAndSanitizeResponse } = require('../../utils/resourceValidator');
const { csrfGuard } = require('../../middleware/csrfGuard');

// Create a minimal Express app for testing
const app = express();
app.use(express.json());
app.use(csrfGuard);

// Mock route that uses the validator
app.post('/api/test/validate-response', async (req, res) => {
    const sanitized = await validateAndSanitizeResponse(req.body);
    res.json(sanitized);
});

describe('Resource Validator Integration', () => {
    it('should sanitize resources in a full API response', async () => {
        const response = await request(app)
            .post('/api/test/validate-response')
            .send({
                metadata: { persona_id: 'test' },
                ui_blocks: [
                    {
                        kind: 'resource_block',
                        id: 'res-1',
                        resources: [
                            { id: 'r1', label: 'Good', url: 'https://solana.com' },
                            { id: 'r2', label: 'Bad', url: 'https://malicious.com' }
                        ]
                    }
                ],
                agent_actions: [],
                next_state: {}
            });

        expect(response.status).toBe(200);
        expect(response.body.ui_blocks[0].resources[0].url).toBe('https://solana.com');
        expect(response.body.ui_blocks[0].resources[1].url).toBe('https://www.google.com/search?q=Bad');
    });

    it('should preserve non-resource blocks unchanged', async () => {
        const response = await request(app)
            .post('/api/test/validate-response')
            .send({
                metadata: { persona_id: 'test' },
                ui_blocks: [
                    {
                        kind: 'text_block',
                        id: 'text-1',
                        title: 'Hello',
                        body_markdown: 'World'
                    },
                    {
                        kind: 'resource_block',
                        id: 'res-1',
                        resources: [
                            { id: 'r1', label: 'Test', url: 'https://bad-site.com' }
                        ]
                    }
                ],
                agent_actions: [],
                next_state: {}
            });

        expect(response.status).toBe(200);
        expect(response.body.ui_blocks[0].kind).toBe('text_block');
        expect(response.body.ui_blocks[0].title).toBe('Hello');
        expect(response.body.ui_blocks[1].resources[0].url).toBe('https://www.google.com/search?q=Test');
    });

    it('should handle empty resource arrays', async () => {
        const response = await request(app)
            .post('/api/test/validate-response')
            .send({
                metadata: { persona_id: 'test' },
                ui_blocks: [
                    {
                        kind: 'resource_block',
                        id: 'res-1',
                        resources: []
                    }
                ],
                agent_actions: [],
                next_state: {}
            });

        expect(response.status).toBe(200);
        expect(response.body.ui_blocks[0].resources).toEqual([]);
    });

    it('should handle responses without ui_blocks', async () => {
        const response = await request(app)
            .post('/api/test/validate-response')
            .send({
                metadata: { persona_id: 'test' },
                agent_actions: [],
                next_state: {}
            });

        expect(response.status).toBe(200);
        expect(response.body.metadata.persona_id).toBe('test');
    });
});
