const mongoose = require('mongoose');

const UserCoursProgressSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cours_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cours',
        required: true
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    last_accessed: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('UserCoursProgress', UserCoursProgressSchema);