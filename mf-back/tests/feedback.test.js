/**
 * @file feedback.test.js
 * @description Tests unitaires du endpoint POST /api/feedback
 */

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Mock des modules utilisés par la route
jest.mock('../memory/agent_metrics', () => ({
  saveFeedback: jest.fn().mockResolvedValue({ saved: true })
}));

// Import du mock
const { saveFeedback } = require('../memory/agent_metrics');

// Import de la route
const feedbackRouter = require('../routes/feedback');

describe('POST /api/feedback – Enregistrement AECO', () => {
  let app;
  let consoleErrorSpy;

  beforeAll(() => {
    app = express();
    app.use(bodyParser.json());
    app.use('/api/feedback', feedbackRouter);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockClear();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  // --- Test 1 : Success ---
  it('devrait enregistrer un feedback utilisateur valide', async () => {
    const payload = {
      agentName: 'InvestorAgent',
      userId: 'user123',
      missionId: 'mission45',
      rating: 4,
      comment: 'Super retour, clair et utile.'
    };

    const res = await request(app)
      .post('/api/feedback')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Feedback utilisateur enregistré avec succès.'
    });

    // Vérifie les appels au module mocké
    expect(saveFeedback).toHaveBeenCalledTimes(1);
    expect(saveFeedback).toHaveBeenCalledWith({
      agent: 'InvestorAgent',
      userId: 'user123',
      missionId: 'mission45',
      aepoScore: null,
      aecoFeedback: {
        satisfaction: 4,
        comment: 'Super retour, clair et utile.'
      }
    });
  });

  // --- Test 2 : Champs manquants ---
  it('devrait renvoyer 400 si agentName ou userId ou rating est manquant', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .send({
        userId: 'user123',
        rating: 5
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'Champs requis manquants.'
    });

    expect(saveFeedback).not.toHaveBeenCalled();
  });

  // --- Test 3 : Erreur serveur ---
  it("devrait renvoyer 500 en cas d'erreur interne", async () => {
    saveFeedback.mockRejectedValue(new Error('Erreur simulée'));

    const res = await request(app)
      .post('/api/feedback')
      .send({
        agentName: 'InvestorAgent',
        userId: 'user123',
        rating: 3
      });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: 'Erreur serveur lors de l’enregistrement du feedback.'
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erreur feedback AECO:',
      expect.any(Error)
    );
  });
});
