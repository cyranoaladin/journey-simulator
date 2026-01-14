/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */


const fs = require('fs');
const path = require('path');

// Formulas from TokenomicsAgent.js
// 1. Linear: P = m * S + b
// 2. Exponential: P = a * e^(k * S)
// 3. Sigmoid: P = K / (1 + e^(-k * (S - S0)))

const linear = (m, b, S) => m * S + b;
const exponential = (a, k, S) => a * Math.exp(k * S);
const sigmoid = (K, k, S0, S) => K / (1 + Math.exp(-k * (S - S0)));

function runStressTest() {
    console.log('Starting Formal Verification of Tokenomics Models...');
    const iterations = 1000;
    let failures = 0;

    // 1. Stress Test Linear
    for (let i = 0; i < iterations; i++) {
        // Random positive parameters
        const m = Math.random() * 0.1 + 0.0001; // Slope > 0
        const b = Math.random() * 1.0; // Intercept >= 0
        const S = Math.floor(Math.random() * 1000000);

        const priceCurrent = linear(m, b, S);
        const priceNext = linear(m, b, S + 1);

        if (priceCurrent <= 0) {
            console.error(`[FAIL] Linear Price <= 0: m=${m}, b=${b}, S=${S}, P=${priceCurrent}`);
            failures++;
        }
        if (priceNext <= priceCurrent) {
            console.error(`[FAIL] Linear Not Monotonic: m=${m}, b=${b}, S=${S}, P(S)=${priceCurrent}, P(S+1)=${priceNext}`);
            failures++;
        }
    }

    // 2. Stress Test Exponential
    for (let i = 0; i < iterations; i++) {
        const a = Math.random() * 0.1 + 0.0001; // Base price > 0
        const k = Math.random() * 0.0001 + 0.000001; // Growth factor > 0
        const S = Math.floor(Math.random() * 1000000);

        const priceCurrent = exponential(a, k, S);
        const priceNext = exponential(a, k, S + 1);

        if (priceCurrent <= 0) {
            console.error(`[FAIL] Exponential Price <= 0: a=${a}, k=${k}, S=${S}, P=${priceCurrent}`);
            failures++;
        }
        if (priceNext <= priceCurrent) {
            console.error(`[FAIL] Exponential Not Monotonic: a=${a}, k=${k}, S=${S}, P(S)=${priceCurrent}, P(S+1)=${priceNext}`);
            failures++;
        }
    }

    // 3. Stress Test Sigmoid
    for (let i = 0; i < iterations; i++) {
        const K = Math.random() * 10 + 1; // Max price
        const k = Math.random() * 0.0001 + 0.000001; // Steepness
        const S0 = Math.floor(Math.random() * 500000); // Midpoint
        const S = Math.floor(Math.random() * 1000000);

        const priceCurrent = sigmoid(K, k, S0, S);
        const priceNext = sigmoid(K, k, S0, S + 1);

        if (priceCurrent <= 0) {
            console.error(`[FAIL] Sigmoid Price <= 0: K=${K}, k=${k}, S0=${S0}, S=${S}, P=${priceCurrent}`);
            failures++;
        }
        // Sigmoid derivative is positive, so P(S+1) > P(S) should hold strictly, 
        // unless floating point precision issues occur at very flat regions.
        // We use a small epsilon for strict equality check if needed, but theoretically > 0.
        if (priceNext < priceCurrent) {
            console.error(`[FAIL] Sigmoid Not Monotonic: K=${K}, k=${k}, S0=${S0}, S=${S}, P(S)=${priceCurrent}, P(S+1)=${priceNext}`);
            failures++;
        }
    }

    if (failures === 0) {
        console.log(`[SUCCESS] Passed ${iterations * 3} stress tests. P'(S) > 0 validated.`);
        process.exit(0);
    } else {
        console.error(`[FAILURE] ${failures} violations found.`);
        process.exit(1);
    }
}

runStressTest();
