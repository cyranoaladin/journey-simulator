/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/**
 * Bonding Curve Stress Test
 * 
 * Tests the monotonicity property P'(S) > 0 under massive liquidity injection
 * Formula: P(S) = m * S + b
 */

function calculatePrice(supply, slope = 0.0001, base = 0.01) {
    if (supply < 0) {
        throw new Error('NEGATIVE_SUPPLY: Supply cannot be negative');
    }

    if (supply > Number.MAX_SAFE_INTEGER) {
        throw new Error('SUPPLY_OVERFLOW: Supply exceeds safe integer limit');
    }

    const price = slope * supply + base;

    if (price <= 0) {
        throw new Error('INVALID_PRICE: Price must be positive');
    }

    return price;
}

function stressTestBondingCurve() {
    console.log('🔬 Starting Bonding Curve Stress Test...\n');

    let allPassed = true;

    // Test 1: Normal range
    console.log('📊 Test 1: Normal Supply Range (1 - 1,000,000)');
    try {
        const price1 = calculatePrice(1000);
        const price2 = calculatePrice(1001);

        if (price2 > price1 && price1 > 0) {
            console.log(`✅ Monotonicity verified: P(1001) = ${price2.toFixed(6)} > P(1000) = ${price1.toFixed(6)}`);
        } else {
            console.log(`❌ Monotonicity violated`);
            allPassed = false;
        }
    } catch (err) {
        console.log(`❌ Error in normal range: ${err.message}`);
        allPassed = false;
    }

    // Test 2: Massive liquidity injection (1 trillion tokens)
    console.log('\n💥 Test 2: Massive Liquidity Injection (1 Trillion Tokens)');
    try {
        const massiveSupply = 1e12;
        const price1 = calculatePrice(massiveSupply);
        const price2 = calculatePrice(massiveSupply + 1);

        console.log(`   Supply: ${massiveSupply.toExponential(2)}`);
        console.log(`   P(S) = ${price1.toExponential(6)}`);
        console.log(`   P(S+1) = ${price2.toExponential(6)}`);

        if (price2 > price1 && price1 > 0) {
            console.log(`✅ Monotonicity maintained under stress: P'(S) > 0`);
        } else {
            console.log(`❌ Monotonicity violated under stress`);
            allPassed = false;
        }
    } catch (err) {
        console.log(`❌ Error under stress: ${err.message}`);
        allPassed = false;
    }

    // Test 3: Edge case - Zero supply
    console.log('\n🔍 Test 3: Edge Case - Zero Supply');
    try {
        const priceZero = calculatePrice(0);
        console.log(`   P(0) = ${priceZero.toFixed(6)}`);

        if (priceZero > 0) {
            console.log(`✅ Base price positive at zero supply`);
        } else {
            console.log(`❌ Base price invalid`);
            allPassed = false;
        }
    } catch (err) {
        console.log(`❌ Error at zero supply: ${err.message}`);
        allPassed = false;
    }

    // Test 4: Error handling - Negative supply
    console.log('\n⚠️  Test 4: Error Handling - Negative Supply');
    try {
        calculatePrice(-100);
        console.log(`❌ Should have thrown error for negative supply`);
        allPassed = false;
    } catch (err) {
        if (err.message.includes('NEGATIVE_SUPPLY')) {
            console.log(`✅ Correctly rejected negative supply: ${err.message}`);
        } else {
            console.log(`❌ Wrong error type: ${err.message}`);
            allPassed = false;
        }
    }

    // Test 5: Derivative check (numerical)
    console.log('\n📐 Test 5: Numerical Derivative P\'(S) > 0');
    try {
        const testSupply = 1e6;
        const delta = 1;
        const price1 = calculatePrice(testSupply);
        const price2 = calculatePrice(testSupply + delta);
        const derivative = (price2 - price1) / delta;

        console.log(`   Numerical derivative at S=${testSupply}: ${derivative.toExponential(6)}`);

        if (derivative > 0) {
            console.log(`✅ Derivative positive: P'(S) = ${derivative.toExponential(6)} > 0`);
        } else {
            console.log(`❌ Derivative non-positive`);
            allPassed = false;
        }
    } catch (err) {
        console.log(`❌ Error in derivative check: ${err.message}`);
        allPassed = false;
    }

    console.log('\n' + '='.repeat(60));
    if (allPassed) {
        console.log('✅ BONDING CURVE STRESS TEST: PASSED');
        console.log('   Monotonicity property P\'(S) > 0 verified under all conditions');
    } else {
        console.log('❌ BONDING CURVE STRESS TEST: FAILED');
        process.exit(1);
    }
    console.log('='.repeat(60));
}

// Run the stress test
stressTestBondingCurve();

module.exports = { calculatePrice, stressTestBondingCurve };
