const express = require('express');
const { saveFeedback } = require('../memory/agent_metrics');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { agentName, userId, missionId, rating, comment } = req.body;

    if (!agentName || !userId || typeof rating === 'undefined') {
      return res.status(400).json({ error: 'Champs requis manquants.' });
    }

    const feedbackData = {
      score: Number(rating),
      comment: comment || ''
    };

    await saveFeedback({
      agent: agentName,
      userId,
      missionId,
      aepoScore: null,
      aecoFeedback: {
        satisfaction: feedbackData.score,
        comment: feedbackData.comment
      }
    });

    res.status(200).json({ message: 'Feedback utilisateur enregistré avec succès.' });
  } catch (err) {
    console.error('Erreur feedback AECO:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l’enregistrement du feedback.' });
  }
});

module.exports = router;
