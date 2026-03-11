/**
 * Real Mode Journey Endpoints - Integration Test
 * Tests authentication and endpoint functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const TEST_USER = {
  email: 'test@mfai.io',
  password: 'test123'
};

let authToken = null;

async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
    authToken = response.data.token;
    console.log('✓ Authentication successful');
    return true;
  } catch (error) {
    console.log('✗ Authentication failed:', error.response?.data?.message || error.message);
    console.log('  Note: Server must be running and user must exist');
    return false;
  }
}

async function testGetUserProgress() {
  try {
    const response = await axios.get(`${BASE_URL}/journey/user-progress`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { personaId: 'cognitive-activation-hub' }
    });
    console.log('✓ GET /journey/user-progress - Success');
    console.log('  Progress:', JSON.stringify(response.data.progress, null, 2).slice(0, 200));
    return true;
  } catch (error) {
    console.log('✗ GET /journey/user-progress - Failed:', error.response?.status, error.response?.data?.message);
    return false;
  }
}

async function testUpdateProgress() {
  try {
    const response = await axios.put(`${BASE_URL}/journey/user-progress`, {
      personaId: 'cognitive-activation-hub',
      total_xp: 100,
      mfai_tokens: 10
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ PUT /journey/user-progress - Success');
    console.log('  Updated XP:', response.data.progress.total_xp);
    return true;
  } catch (error) {
    console.log('✗ PUT /journey/user-progress - Failed:', error.response?.status, error.response?.data?.message);
    return false;
  }
}

async function testCompletePhase() {
  try {
    const response = await axios.post(`${BASE_URL}/journey/complete-phase`, {
      personaId: 'cognitive-activation-hub',
      phase_number: 1,
      xp_reward: 60,
      mfai_reward: 6,
      nft_reward: 'Proof-of-Skill: Web3 Orientation'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ POST /journey/complete-phase - Success');
    console.log('  Completed phases:', response.data.progress.completed_phases);
    return true;
  } catch (error) {
    console.log('✗ POST /journey/complete-phase - Failed:', error.response?.status, error.response?.data?.message);
    return false;
  }
}

async function testGetHistory() {
  try {
    const response = await axios.get(`${BASE_URL}/journey/history`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { personaId: 'cognitive-activation-hub' }
    });
    console.log('✓ GET /journey/history - Success');
    console.log('  History entries:', response.data.history.length);
    return true;
  } catch (error) {
    console.log('✗ GET /journey/history - Failed:', error.response?.status, error.response?.data?.message);
    return false;
  }
}

async function testGetArtifacts() {
  try {
    const response = await axios.get(`${BASE_URL}/journey/artifacts`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { personaId: 'cognitive-activation-hub' }
    });
    console.log('✓ GET /journey/artifacts - Success');
    console.log('  Artifacts:', response.data.artifacts.length);
    return true;
  } catch (error) {
    console.log('✗ GET /journey/artifacts - Failed:', error.response?.status, error.response?.data?.message);
    return false;
  }
}

async function testInteractiveStep() {
  try {
    const response = await axios.post(`${BASE_URL}/journey/cognitive-activation-hub/step`, {
      phaseId: 'cognitive-orientation',
      userInput: 'Tell me about Web3 paradigms'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ POST /journey/:id/step (Zyno) - Success');
    console.log('  Zyno response:', response.data.success ? 'OK' : 'Failed');
    return true;
  } catch (error) {
    console.log('✗ POST /journey/:id/step - Failed:', error.response?.status, error.response?.data?.message);
    return false;
  }
}

async function runTests() {
  console.log('=========================================');
  console.log('Real Mode Journey Endpoints - Test Suite');
  console.log('=========================================\n');
  
  console.log('Prerequisites:');
  console.log('  - Backend server running on port 3001');
  console.log('  - PostgreSQL database accessible');
  console.log('  - Test user exists in database\n');
  
  console.log('1. Authentication...');
  const authenticated = await login();
  if (!authenticated) {
    console.log('\n✗ Tests aborted - Authentication required');
    process.exit(1);
  }
  
  console.log('\n2. Testing Journey Endpoints...');
  await testGetUserProgress();
  await testUpdateProgress();
  await testCompletePhase();
  await testGetHistory();
  await testGetArtifacts();
  
  console.log('\n3. Testing Zyno Orchestration...');
  await testInteractiveStep();
  
  console.log('\n=========================================');
  console.log('Test Suite Complete');
  console.log('=========================================');
}

runTests().catch(console.error);
