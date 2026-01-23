/**
 * Smoke Test: Agent Initialization
 * Verifies that agents can be loaded without mongoose/models errors
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAgentInit() {
    console.log('🧪 Starting Agent Initialization Smoke Test...\n');

    const errors: string[] = [];
    const successes: string[] = [];

    // Test 1: Database connection
    console.log('1️⃣  Testing database connection...');
    try {
        await prisma.$queryRaw`SELECT 1`;
        successes.push('Database connection OK');
        console.log('   ✅ Database connected via Prisma');
    } catch (e: any) {
        errors.push(`Database connection failed: ${e.message}`);
        console.log('   ❌ Database connection failed');
    }

    // Test 2: BaseAgent import
    console.log('\n2️⃣  Testing BaseAgent import...');
    try {
        const BaseAgent = require('../agents/BaseAgent');
        if (BaseAgent) {
            successes.push('BaseAgent imported OK');
            console.log('   ✅ BaseAgent imported successfully');
        }
    } catch (e: any) {
        errors.push(`BaseAgent import failed: ${e.message}`);
        console.log(`   ❌ BaseAgent import failed: ${e.message}`);
    }

    // Test 3: Agent Registry import
    console.log('\n3️⃣  Testing Agent Registry...');
    try {
        const agentRegistry = require('../orchestration/agentsRegistry');
        if (agentRegistry) {
            const agentNames = Object.keys(agentRegistry);
            successes.push(`Agent Registry loaded: ${agentNames.length} agents`);
            console.log(`   ✅ Agent Registry loaded with ${agentNames.length} agents`);
            console.log(`   📋 Available agents: ${agentNames.slice(0, 5).join(', ')}...`);
        }
    } catch (e: any) {
        errors.push(`Agent Registry import failed: ${e.message}`);
        console.log(`   ❌ Agent Registry import failed: ${e.message}`);
    }

    // Test 4: ZynoOrchestrator import
    console.log('\n4️⃣  Testing ZynoOrchestrator...');
    try {
        const zyno = require('../orchestration/zynoOrchestrator');
        if (zyno) {
            successes.push('ZynoOrchestrator imported OK');
            console.log('   ✅ ZynoOrchestrator imported successfully');
        }
    } catch (e: any) {
        errors.push(`ZynoOrchestrator import failed: ${e.message}`);
        console.log(`   ❌ ZynoOrchestrator import failed: ${e.message}`);
    }

    // Test 5: Agent idempotence utilities
    console.log('\n5️⃣  Testing Agent Idempotence utilities...');
    try {
        const { generateIdempotencyKey, findOrCreateAgentRun } = require('../utils/agent-idempotence');
        const testKey = generateIdempotencyKey('test-journey', 'step-1', 'TestAgent', { userId: 'test' });
        if (testKey && typeof testKey === 'string') {
            successes.push('Agent idempotence utilities OK');
            console.log(`   ✅ generateIdempotencyKey works: ${testKey.substring(0, 16)}...`);
        }
    } catch (e: any) {
        errors.push(`Agent idempotence failed: ${e.message}`);
        console.log(`   ❌ Agent idempotence failed: ${e.message}`);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SMOKE TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${successes.length}`);
    console.log(`❌ Failed: ${errors.length}`);

    if (errors.length > 0) {
        console.log('\n❌ FAILURES:');
        errors.forEach(e => console.log(`   - ${e}`));
        process.exit(1);
    } else {
        console.log('\n🎉 All tests passed! Agents are ready for Prisma.');
        process.exit(0);
    }
}

testAgentInit().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
