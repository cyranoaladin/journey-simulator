const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'https://journey.mfai.app/api';

async function reproduceError() {
    const url = `${BASE_URL}/journeys/e423ee4a-6ebe-41d6-b7e9-cb2ab90bf4eb/submit`;

    // Mock payload mimicking the frontend quiz submission
    const payload = {
        missionId: "quiz_cognitive_1", // Dummy ID
        inputType: "quiz_submission",
        submission: JSON.stringify({
            answers: { "q1": 0, "q2": 1 },
            score: 2,
            max_score: 2,
            mode: "certifying"
        }),
        language: "en",
        mode: "builder",
        tone: "pedagogical",
        trackId: "cognitive-activation-hub",
        phaseId: "cognitive-orientation",
        journeyState: {}
    };

    try {
        console.log('Sending request to:', url);
        const response = await axios.post(url, payload, {
            headers: {
                // We might need a valid token if the endpoint is protected.
                // Assuming dev environment might have relaxed auth or we need to login first.
                // If 401, we know it's auth. If 500, it's the logic.
                "Content-Type": "application/json"
            }
        });
        console.log('Success:', response.data);
    } catch (error) {
        console.error('Error Status:', error.response?.status);
        console.error('Error Data:', error.response?.data);
        if (error.response?.status === 401) {
            console.log('Auth required. Need to login first.');
        }
    }
}

reproduceError();
