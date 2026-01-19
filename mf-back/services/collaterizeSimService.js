/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const axios = require('axios');

async function simulateCollaterizeLaunch(params) {
    const baseUrl = process.env.WEB_API_BASE_URL || 'http://localhost:3003'; // Default to local Next.js port

    try {
        const res = await axios.post(`${baseUrl}/api/integrations/collaterize/simulate`, params, {
            timeout: 10000, // Augmenter le timeout
            headers: {
                'Content-Type': 'application/json',
                // 'x-internal-api-key': process.env.INTERNAL_API_KEY_MFBACK // Uncomment if auth is required
            }
        });

        if (!res.data?.ok) {
            throw new Error('Collaterize simulation API returned not ok');
        }

        return res.data.simulation;
    } catch (error) {
        console.error('Collaterize simulation service error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
}

module.exports = { simulateCollaterizeLaunch };