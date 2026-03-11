/**
 * Phase 3: Live Server Integration Test
 * Tests all Real mode endpoints with authentication
 */

const jwt = require('jsonwebtoken');
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const JWT_SECRET = process.env.JWT_SECRET || 'lead9_secret_key_hard_mode';
const TEST_USER_ID = '04c95b7d-225d-42cd-b990-879efef5946e';

// Generate test JWT token
const token = jwt.sign({ id: TEST_USER_ID, email: 'demo@mfai.local' }, JWT_SECRET, { expiresIn: '1h' });

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

const testEndpoint = async (name, method, url, data = null) => {
  try {
    const config = { headers, method, url: `${BASE_URL}${url}` };
    if (data) config.data = data;
    
    const response = await axios(config);
    console.log(`✓ ${name}: ${response.status} ${response.statusText}`);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    console.log(`✗ ${name}: ${error.response?.status || 'ERROR'} - ${error.response?.data?.message || error.message}`);
    return { success: false, error: error.response?.data || error.message };
  }
};

async function runPhase3Tests() {
  console.log('\n🧪 PHASE 3: LIVE SERVER INTEGRATION TESTS\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const results = [];
  const personaId = 'cognitive-activation-hub';
  
  // Test 1: GET user-progress (new user, should auto-create)
  console.log('1️⃣  Testing GET /journey/user-progress');
  const r1 = await testEndpoint(
    'Get User Progress',
    'GET',
    `/journey/user-progress?personaId=${personaId}`
  );
  results.push(r1);
  
  // Test 2: PUT update-progress
  console.log('\n2️⃣  Testing PUT /journey/user-progress');
  const r2 = await testEndpoint(
    'Update Progress',
    'PUT',
    '/journey/user-progress',
    { personaId, total_xp: 100, mfai_tokens: 10, completed_phases: [1] }
  );
  results.push(r2);
  
  // Test 3: POST complete-phase
  console.log('\n3️⃣  Testing POST /journey/complete-phase');
  const r3 = await testEndpoint(
    'Complete Phase',
    'POST',
    '/journey/complete-phase',
    { 
      personaId, 
      phase_number: 1, 
      xp_reward: 60, 
      mfai_reward: 6,
      title: 'Cognition Ignition',
      nft_address: 'nft_test_123'
    }
  );
  results.push(r3);
  
  // Test 4: GET history
  console.log('\n4️⃣  Testing GET /journey/history');
  const r4 = await testEndpoint(
    'Get History',
    'GET',
    `/journey/history?personaId=${personaId}`
  );
  results.push(r4);
  
  // Test 5: GET artifacts
  console.log('\n5️⃣  Testing GET /journey/artifacts');
  const r5 = await testEndpoint(
    'Get Artifacts',
    'GET',
    `/journey/artifacts?personaId=${personaId}`
  );
  results.push(r5);
  
  // Test 6: GET user-journeys
  console.log('\n6️⃣  Testing GET /journey/user-journeys');
  const r6 = await testEndpoint(
    'Get User Journeys',
    'GET',
    '/journey/user-journeys'
  );
  results.push(r6);
  
  // Test 7: POST submit mission
  console.log('\n7️⃣  Testing POST /journey/:journeyId/submit');
  const r7 = await testEndpoint(
    'Submit Mission',
    'POST',
    `/journey/${personaId}/submit`,
    { 
      phaseId: 'cognitive-orientation',
      personaId,
      text: 'Mission completed successfully',
      deliverableLink: 'https://example.com/deliverable'
    }
  );
  results.push(r7);
  
  // Test 8: POST interactive step (Zyno)
  console.log('\n8️⃣  Testing POST /journey/:journeyId/step (Zyno)');
  const r8 = await testEndpoint(
    'Interactive Step',
    'POST',
    `/journey/${personaId}/step`,
    { 
      phaseId: 'cognitive-orientation',
      userInput: 'What is Web3?',
      userAction: 'ask_question'
    }
  );
  results.push(r8);
  
  // Test 9: Demo route (public)
  console.log('\n9️⃣  Testing POST /journey/load-demo (Public)');
  try {
    const response = await axios.post(`${BASE_URL}/journey/load-demo`, {
      personaId: 'capital-foundry'
    });
    console.log(`✓ Load Demo: ${response.status} ${response.statusText}`);
    results.push({ success: true, status: response.status });
  } catch (error) {
    console.log(`✗ Load Demo: ${error.response?.status || 'ERROR'}`);
    results.push({ success: false });
  }
  
  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📊 TEST SUMMARY\n');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);
  
  console.log(`Tests Passed: ${passed}/${total}`);
  console.log(`Pass Rate: ${percentage}%`);
  
  if (passed === total) {
    console.log('\n✅ ALL TESTS PASSED - Phase 3 Complete!\n');
  } else {
    console.log(`\n⚠️  ${total - passed} test(s) failed\n`);
  }
  
  return { passed, total, percentage };
}

// Run tests
runPhase3Tests()
  .then(result => {
    process.exit(result.passed === result.total ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test suite error:', error);
    process.exit(1);
  });
