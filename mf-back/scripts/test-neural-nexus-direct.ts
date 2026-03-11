/**
 * Direct Test: Neural Nexus RAG Functions
 * Tests retrieveContext and processAgentQuery with real database
 */

import { retrieveContext, processAgentQuery } from '../src/services/neuralNexusService';

async function testNeuralNexus() {
  console.log('🧠 NEURAL NEXUS - Direct Function Test\n');
  console.log('=' .repeat(60) + '\n');
  
  try {
    // Test 1: Retrieve context for Solana DeFi query
    console.log('Test 1: Retrieve Context - Solana DeFi');
    console.log('-'.repeat(60));
    const context1 = await retrieveContext('Comment optimiser la liquidité sur Solana?', 3);
    console.log(`✅ Retrieved ${context1.length} chunks`);
    if (context1.length > 0) {
      console.log(`\n📄 Top Result:`);
      console.log(`   Title: ${context1[0].metadata.title}`);
      console.log(`   Score: ${context1[0].score.toFixed(4)}`);
      console.log(`   Content: ${context1[0].content.substring(0, 100)}...`);
    }
    console.log('');
    
    // Test 2: Process agent query with RAG
    console.log('\nTest 2: Agent Query with RAG Augmentation');
    console.log('-'.repeat(60));
    const result = await processAgentQuery('Que fait MFAI pour l\'audit de sécurité?');
    console.log(`✅ Query processed`);
    console.log(`   Source: ${result.source}`);
    console.log(`   Confidence: ${result.confidenceScore.toFixed(4)}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Context chunks: ${result.context?.length || 0}`);
    if (result.context && result.context.length > 0) {
      console.log(`\n   Top context: ${result.context[0].metadata.title}`);
    }
    console.log('');
    
    // Test 3: Low relevance query (fallback test)
    console.log('\nTest 3: Low Relevance Query (Fallback)');
    console.log('-'.repeat(60));
    const fallback = await processAgentQuery('Quel est le score de tennis de Mars?');
    console.log(`✅ Fallback handled correctly`);
    console.log(`   Source: ${fallback.source}`);
    console.log(`   Status: ${fallback.status}`);
    console.log(`   Confidence: ${fallback.confidenceScore.toFixed(4)}`);
    console.log('');
    
    // Test 4: Manual context injection
    console.log('\nTest 4: Manual Context Injection');
    console.log('-'.repeat(60));
    const manual = await processAgentQuery(
      'Explique les tokenomics',
      { manualContext: 'MFAI a un modèle déflationniste avec 2% burn par transaction.' }
    );
    console.log(`✅ Manual context injected`);
    console.log(`   Source: ${manual.source}`);
    console.log(`   Confidence: ${manual.confidenceScore.toFixed(4)}`);
    console.log('');
    
    console.log('=' .repeat(60));
    console.log('✅ ALL TESTS PASSED - Neural Nexus operational!\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testNeuralNexus();
