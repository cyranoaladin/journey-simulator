var express = require('express');
var router = express.Router();
const journeyController = require('../controllers/journey-controller');

router.get('/all-journey',journeyController.getAllJourney)
router.post('/add-journey', journeyController.createJourney)
router.put('/update-journey',journeyController.updateJourney)
router.delete('/delete/:id', journeyController.deleteJourney)
