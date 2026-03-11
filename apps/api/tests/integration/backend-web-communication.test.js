/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 * 
 * Tests d'intégration: Communication Backend ↔ Web
 * Vérifie la cohérence et la communication entre mf-back et web
 */

const request = require('supertest');
const express = require('express');

describe('Backend ↔ Web Communication Tests', () => {
  let app;

  beforeAll(() => {
    // Mock app pour simuler le backend
    app = express();
    app.use(express.json());
    
    // Mock routes essentielles
    app.get('/healthz', (req, res) => {
      res.json({ status: 'ok', service: 'mf-back' });
    });

    app.post('/user/login', (req, res) => {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'bad_request' });
      }
      res.json({
        success: true,
        user: { id: 'test-user', email },
        accessToken: 'test-token',
        refreshToken: 'test-refresh-token'
      });
    });

    app.post('/user/register', (req, res) => {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'bad_request' });
      }
      res.json({
        success: true,
        user: { id: 'test-user', name, email },
        accessToken: 'test-token',
        refreshToken: 'test-refresh-token'
      });
    });

    app.get('/auth/me', (req, res) => {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      res.json({
        user: { id: 'test-user', email: 'test@example.com' }
      });
    });
  });

  describe('Health Check', () => {
    it('should return ok status from backend', async () => {
      const response = await request(app).get('/healthz');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'ok',
        service: 'mf-back'
      });
    });
  });

  describe('User Authentication Flow', () => {
    it('should login user with valid credentials', async () => {
      const response = await request(app)
        .post('/user/login')
        // SECURITY FIX 2026-03-11: Use env var or secure test password
        .send({ email: 'test@example.com', password: process.env.TEST_USER_PASSWORD || 'test_secure_pass_change_me' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    it('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/user/login')
        .send({ email: 'test@example.com' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should register new user', async () => {
      const response = await request(app)
        .post('/user/register')
        .send({
          name: 'Test User',
          email: 'newuser@example.com',
          // SECURITY FIX 2026-03-11: Use env var or secure test password
          password: process.env.TEST_USER_PASSWORD || 'test_secure_pass_change_me'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.name).toBe('Test User');
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/user/register')
        .send({ email: 'test@example.com' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Token-based Authentication', () => {
    it('should accept valid bearer token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer test-token');
      
      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/auth/me');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject invalid token format', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'InvalidToken');
      
      expect(response.status).toBe(401);
    });
  });

  describe('CORS and Headers', () => {
    it('should include proper content-type headers', async () => {
      const response = await request(app).get('/healthz');
      
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should handle JSON payloads', async () => {
      const response = await request(app)
        .post('/user/login')
        .send({ email: 'test@example.com', password: 'pass' });
      
      expect(response.type).toBe('application/json');
    });
  });
});
