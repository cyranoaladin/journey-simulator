const Journey = require('../models/Journeys');


exports.createJourney = async (req, res) => {
    const {
        user_id,
        user_wallet,
        journey_type,
        start_date,
        current_phase,
        completion_percentage,
        phases_status } = req.body;
    const journey = new Journey({
        user_id,
        user_wallet,
        journey_type,
        start_date,
        current_phase,
        completion_percentage,
        phases_status
    });
    await journey.save();
    res.status(201).json(journey);
};

exports.getJourney = async (req, res) => {
    const journey = await Journey.findById(req.params.id);
    res.status(200).json(journey);
};

exports.getAllJourney = async (req, res) =>{
    const journey = await Journey.getAllJourney()
    res.status(200).json(journey)
}

exports.updateJourney = async (req, res) => {
    const {
        user_id,
        user_wallet,
        journey_type,
        start_date,
        current_phase,
        completion_percentage,
        phases_status } = req.body;
    const journey = await Journey.findByIdAndUpdate(req.params.id, {
        user_id,
        user_wallet,
        journey_type,
        start_date,
        current_phase,
        completion_percentage,
        phases_status
    }, { new: true });
    res.status(200).json(journey);
};

exports.deleteJourney = async (req, res) => {
    await Journey.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Journey deleted successfully' });
};  