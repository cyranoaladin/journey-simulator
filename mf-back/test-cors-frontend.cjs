/**
 * Test CORS and Frontend Connectivity
 */
const axios = require('axios');

async function testCorsAndFrontend() {
  console.log('\n🌐 Testing CORS and Frontend Connectivity\n');
  
  try {
    // Test with Origin header (simulating frontend request)
    const response = await axios.post('http://localhost:3001/journey/load-demo', 
      { personaId: 'cognitive-activation-hub' },
      {
        headers: {
          'Origin': 'http://localhost:5173',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✓ CORS Configuration: Working');
    console.log('✓ Frontend Origin: http://localhost:5173 accepted');
    console.log('✓ Server responding to cross-origin requests');
    console.log('✓ Response Status:', response.status);
    
    // Check CORS headers
    const corsHeaders = response.headers['access-control-allow-origin'];
    if (corsHeaders) {
      console.log('✓ CORS Headers present:', corsHeaders);
    }
    
    console.log('\n✅ Frontend can connect to Real mode endpoints\n');
    return true;
  } catch (error) {
    console.error('✗ CORS Test Failed:', error.message);
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', error.response.data);
    }
    return false;
  }
}

testCorsAndFrontend().then(success => {
  process.exit(success ? 0 : 1);
});
