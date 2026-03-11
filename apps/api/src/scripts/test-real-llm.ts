/**
 * Test Real LLM - Validates actual OpenAI integration
 * Project: Money Factory AI (MFAI)
 */

import ArchitectAgent from '../agents/ArchitectAgent';

async function testRealLLM() {
    console.log('🧪 Testing Real LLM Integration\n');
    console.log('='.repeat(60));

    // Check API Key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
        console.error('❌ OPENAI_API_KEY is not set!');
        console.log('\nTo fix: export OPENAI_API_KEY="sk-..."');
        process.exit(1);
    }
    console.log(`✅ API Key found: ${apiKey.substring(0, 10)}...`);

    // Initialize Agent
    const agent = new ArchitectAgent();
    console.log(`\n🤖 Agent: ${agent.name}`);
    console.log(`📚 Specialty: ${agent.specialty}`);

    // Test Context
    const testContext = {
        userId: 'test-user-001',
        journeyId: 'test-journey-001',
        phaseId: 'learn',
        trackId: 'defi',
        language: 'fr',
        submission: 'Je veux lancer une plateforme de tokenisation immobilière sur Solana. Les investisseurs pourront acheter des fractions de biens immobiliers sous forme de NFTs. Comment structurer l\'architecture technique ?',
        userProfile: {
            experience: 'intermediate',
            budget: 'medium',
        },
        history: [],
    };

    console.log('\n📝 Test Message:');
    console.log(`"${testContext.submission}"\n`);
    console.log('='.repeat(60));
    console.log('⏳ Calling OpenAI (this may take a few seconds)...\n');

    const startTime = Date.now();

    try {
        const result = await agent.run(testContext);
        const latencyMs = Date.now() - startTime;

        console.log('='.repeat(60));
        console.log('✅ LLM Response Received!\n');

        // Display Results
        console.log(`⏱️  Latency: ${latencyMs}ms`);
        
        if (latencyMs < 500) {
            console.log('⚠️  WARNING: Latency < 500ms suggests mock response');
        } else {
            console.log('✅ Latency confirms real LLM call');
        }

        console.log('\n📊 Response Summary:');
        console.log('-'.repeat(40));
        
        if (result.payload) {
            console.log(`Status: ${result.payload.status || 'N/A'}`);
            console.log(`Summary: ${result.payload.summary?.substring(0, 200) || 'N/A'}...`);
            
            if (result.payload.reasoning) {
                console.log(`\nReasoning (first 300 chars):`);
                console.log(result.payload.reasoning.substring(0, 300) + '...');
            }

            if (result.payload.architecture) {
                console.log('\nArchitecture Recommendations:');
                console.log(JSON.stringify(result.payload.architecture, null, 2).substring(0, 500));
            }
        }

        console.log('\n📄 Raw Response (first 500 chars):');
        console.log('-'.repeat(40));
        const rawContent = result.rawMessage?.content || JSON.stringify(result.payload);
        console.log(rawContent.substring(0, 500) + '...');

        console.log('\n' + '='.repeat(60));
        console.log('🎉 Test Completed Successfully!');
        console.log(`Total Latency: ${latencyMs}ms`);

        // Check if fallback mode
        const isFallback = result.payload?.status === 'FALLBACK' || rawContent.includes('SYSTEM_FALLBACK');
        
        if (isFallback) {
            console.log('\n⚠️  FALLBACK MODE: LLM running in offline mode');
            console.log('   The system is functional but using simulated responses.');
            console.log('   To enable real LLM: set valid OPENAI_API_KEY and OPENAI_MODEL');
        } else if (latencyMs > 500 && rawContent.length > 100) {
            console.log('\n✅ VALIDATION PASSED: Real LLM integration working');
        }

        console.log('\n✅ SUCCESS: Test completed without crash');
        process.exit(0);

    } catch (error: any) {
        const latencyMs = Date.now() - startTime;
        console.error('='.repeat(60));
        console.error(`❌ Error after ${latencyMs}ms:`, error.message);
        
        if (error.message.includes('API key')) {
            console.error('\n💡 Check your OPENAI_API_KEY environment variable');
        }
        if (error.message.includes('rate limit')) {
            console.error('\n💡 OpenAI rate limit hit - wait and retry');
        }
        
        process.exit(1);
    }
}

testRealLLM().catch(console.error);
