const express = require('express');
const router = express.Router();
const coursController = require('../controllers/cours-controller');

// --- Cours CRUD ---
router.post('/cours', coursController.createCours); // Create a course
router.get('/all-cours', coursController.getAllCours); // Get all courses
router.get('/cours/:id', coursController.getCoursById); // Get course by ID
router.put('/update-cours/:id', coursController.updateCours); // Update course
router.delete('/delete-cours/:id', coursController.deleteCours); // Delete course

// --- UserCoursProgress ---
router.post('/user-progress/progress', coursController.setUserCoursProgress); // Set or update user progress
router.get('/get-usser-progress/progress', coursController.getUserCoursProgress); // Get user progress for a course

module.exports = router;
