/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const express = require('express');
const router = express.Router();
const Journey = require('../models/Journeys');
const User = require('../models/user');
const { simulateCollaterizeLaunch } = require('../services/collaterizeSimService');

router.post('/journeys/:id/phases/launch-collaterize/simulate', async (req, res) => {
    try {
        const journeyId = req.params.id;
        const journey = await Journey.findById(journeyId);
        if (!journey) return res.status(404).json({ error: 'journey_not_found' });

        const user = await User.findById(journey.user_id);
        if (!user) return res.status(404).json({ error: 'user_not_found' });

        // Retrieve real journey metrics if available
        const journeyScore = journey.score || user.total_xp / 10 || 75; // Use XP score as base
        const riskScore = Math.min(0.9, Math.max(0, (100 - (user.total_xp / 10 || 75)) / 100)); // Risk inversely proportional to score
        const communityScore = 70 + (Math.random() * 20); // Random score 70-90 for demo
        const docsScore = 65 + (Math.random() * 25); // Random score 65-90 for demo

        // Token configuration (from journey data or defaults)
        const tokenSymbol = 'MFAI';
        const totalSupply = 1_000_000_000;
        const circulatingAtTGE = 50_000_000 + (user.total_xp * 1000); // Higher XP = more tokens in circulation
        const fundraisingGoalUSD = 200_000 + (user.total_xp * 10); // Higher XP = higher fundraising goal

        const simulation = await simulateCollaterizeLaunch({
            wallet: journey.user_wallet,
            tokenSymbol,
            totalSupply,
            circulatingAtTGE,
            fundraisingGoalUSD,
            journeyScore,
            riskScore,
            communityScore,
            docsScore,
        });

        // Update journey with simulation result
        journey.collaterizeSimulation = simulation;

        // Update phase status
        const launchPhaseIndex = journey.phases_status.findIndex(p => p.phase_number === 4);
        if (launchPhaseIndex !== -1) {
            journey.phases_status[launchPhaseIndex].status = 'completed';
            journey.phases_status[launchPhaseIndex].completion_date = new Date();
        }

        await journey.save();

        res.json({ ok: true, simulation });
    } catch (e) {
        console.error('launch-collaterize simulate error', e);
        res.status(500).json({ error: 'internal_error', details: e.message });
    }
});

module.exports = router;