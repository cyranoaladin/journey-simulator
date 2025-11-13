const Cours = require('../models/cours');
const UserCoursProgress = require('../models/userCoursProgress');

// Create a new course
exports.createCours = async (req, res) => {
    try {
        const cours = new Cours(req.body);
        await cours.save();
        res.status(201).json(cours);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all courses
exports.getAllCours = async (req, res) => {
    try {
        const courses = await Cours.find();
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single course by ID
exports.getCoursById = async (req, res) => {
    try {
        const cours = await Cours.findById(req.params.id);
        if (!cours) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json(cours);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a course
exports.updateCours = async (req, res) => {
    try {
        const cours = await Cours.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!cours) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json(cours);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a course
exports.deleteCours = async (req, res) => {
    try {
        await Cours.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create or update user progress for a course
exports.setUserCoursProgress = async (req, res) => {
    try {
        const { user_id, cours_id, progress } = req.body;
        let userProgress = await UserCoursProgress.findOne({ user_id, cours_id });
        if (userProgress) {
            userProgress.progress = progress;
            userProgress.last_accessed = Date.now();
            await userProgress.save();
        } else {
            userProgress = new UserCoursProgress({ user_id, cours_id, progress });
            await userProgress.save();
        }
        res.status(200).json(userProgress);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get user progress for a specific course
exports.getUserCoursProgress = async (req, res) => {
    try {
        const { user_id, cours_id } = req.query;
        const userProgress = await UserCoursProgress.findOne({ user_id, cours_id });
        if (!userProgress) return res.status(404).json({ message: 'Progress not found' });
        res.status(200).json(userProgress);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
