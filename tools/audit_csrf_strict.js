
const axios = require('../mf-back/node_modules/axios');
const axiosInstance = axios.default || axios;

const BACKEND_URL = 'http://localhost:3002';

(async () => {
    // 1. Connectivity Check
    try {
        console.log('Checking connectivity on /journey/all-journey...');
        await axiosInstance.get(`${BACKEND_URL}/journey/all-journey`);
        console.log('[PASS] /journey/all-journey is reachable.');
    } catch (e) {
        console.error('[WARN] /journey/all-journey failed: ' + e.message);
        if (e.response) {
            console.error('Status:', e.response.status);
            console.error('Data:', e.response.data);
        }
    }

    console.log('Starting CSRF Strictness Audit on /journey/action...');

    // 2. Attempt POST without CSRF headers (stateless)
    try {
        await axiosInstance.post(`${BACKEND_URL}/journey/action`, {
            action: 'complete_phase',
            phase_number: 1
        });
        console.error('[FAIL] Request succeeded (200 OK) without CSRF token! SYSTEM VULNERABLE.');
        process.exit(1);
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            console.log(`Response Status: ${status}`);
            console.log('Response Headers:', error.response.headers);
            console.log('Response Data:', error.response.data);

            if (status === 403 || status === 401) {
                console.log(`[PASS] Request rejected with status ${status}. CSRF Guard Active.`);
                // If we get 403/401 here, we are good.
                process.exit(0);
            } else {
                console.error(`[FAIL] Logically rejected, but with unexpected status: ${status}. Expected 403/401.`);
                process.exit(1);
            }
        } else {
            console.error(`[FAIL] Network Error: ${error.message}`);
            process.exit(1);
        }
    }
})();
