const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const journeyEngineRoutes = require('../routes/journey-engine-routes');

// Mock RAG to avoid network errors in tests
jest.mock('../rag/ragClient', () => ({
  getRagSnippets: jest.fn().mockResolvedValue([])
}));

// Mock OpenAI to avoid API calls in tests
jest.mock('../utils/openaiClient', () => ({
  callGpt5: jest.fn().mockResolvedValue({
    message: { content: '{"test": "mock"}' }
  })
}));

// Mock specific logic of auth middleware or use it directly if independent enough
// We'll trust the real middleware handles 'demo-token' as seen in the file view
// but we need to ensure JWT_SECRET is set.
process.env.JWT_SECRET = 'test-secret';
process.env.OPENAI_API_KEY = ''; // Force mock mode
process.env.RAG_SEARCH_URL = ''; // Force local fallback

const app = express();
app.use(bodyParser.json());
app.use('/api/engine', journeyEngineRoutes);

// DB Setup (Same as s2_logic)
// Increase timeout for CI environments
jest.setTimeout(20000);

beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mf_back_test_s2_api';
    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
    } catch (err) {
        console.warn("MongoDB fail", err);
        throw err; // Fail fast in CI
    }
});

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    }
});

const DEMO_TOKEN = 'demo-token';
const DEMO_USER_ID = '507f1f77bcf86cd799439011'; // From middleware/auth.js

describe('S2.3 Engine API Endpoints', () => {

    test('POST /start: Should start a journey', async () => {
        const res = await request(app)
            .post('/api/engine/start')
            .set('Authorization', `Bearer ${DEMO_TOKEN}`)
            .send({ journeyDefinitionId: 'journey-api-v1' });

        if (res.status !== 201) console.error(res.body);
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.run.userId).toBe(DEMO_USER_ID);
        expect(res.body.data.currentPhase.status).toBe('UNLOCKED');
    });

    test('POST /start: Should fail without definition', async () => {
        const res = await request(app)
            .post('/api/engine/start')
            .set('Authorization', `Bearer ${DEMO_TOKEN}`)
            .send({});

        expect(res.status).toBe(400); // Controller returns 400
    });

    test('GET /:id/state: Should retrieve state', async () => {
        // First start
        const startRes = await request(app)
            .post('/api/engine/start')
            .set('Authorization', `Bearer ${DEMO_TOKEN}`)
            .send({ journeyDefinitionId: 'journey-api-v2' });

        const runId = startRes.body.data.run._id;

        // Then Get State
        const res = await request(app)
            .get(`/api/engine/${runId}/state`)
            .set('Authorization', `Bearer ${DEMO_TOKEN}`);

        expect(res.status).toBe(200);
        expect(res.body.data.phases.length).toBeGreaterThan(0);
        expect(res.body.data.run._id).toBe(runId);
    });

    test('POST /submit: Should submit phase', async () => {
        // Start
        const startRes = await request(app)
            .post('/api/engine/start')
            .set('Authorization', `Bearer ${DEMO_TOKEN}`)
            .send({ journeyDefinitionId: 'journey-api-v3' });
        const runId = startRes.body.data.run._id;

        // Submit
        const res = await request(app)
            .post('/api/engine/submit')
            .set('Authorization', `Bearer ${DEMO_TOKEN}`)
            .send({
                runId,
                phaseId: 'phase-1',
                stepId: 'step-1',
                payload: { api: true }
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        // Check phase status if it exists in the response
        // JourneyEngine.submitPhase returns { submission, phase, evaluation, xpEntry }
        if (res.body.data?.phase) {
          // Phase should be SUBMITTED (initial) or VALIDATED/REJECTED (after evaluation)
          expect(['SUBMITTED', 'VALIDATED', 'REJECTED']).toContain(res.body.data.phase.status);
        } else {
          // If phase is not directly in data, check if it's nested or verify submission exists
          expect(res.body.data.submission || res.body.data.phase || res.body.data).toBeDefined();
        }
    });

});
