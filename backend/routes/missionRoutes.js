const express = require('express');
const router = express.Router();
const MissionController = require('../controllers/MissionController');

// Définition de la route POST pour soumettre une mission
// URL finale : http://localhost:3000/api/missions/submit
router.post('/submit', (req, res) => MissionController.submitMission(req, res));

module.exports = router;
