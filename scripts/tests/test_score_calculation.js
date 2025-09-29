// Test script to verify score calculation logic
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testScoreCalculation() {
  console.log('🧮 Testing Score Calculation Logic');
  console.log('==================================');

  try {
    // Step 1: Register user
    const timestamp = Date.now();
    const userData = {
      email: `testuser_${timestamp}@example.com`,
      password: 'TestPassword123!',
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Test Street',
      phone: '+1234567890'
    };

    console.log('📝 Registering user...');
    const registerResponse = await axios.post(`${API_BASE_URL}/users/register`, userData);
    const userId = registerResponse.data.id;
    const lifeWheelId = registerResponse.data.lifeWheel.id;
    
    console.log(`✅ User registered: ${userId}`);
    console.log(`✅ LifeWheel created: ${lifeWheelId}`);

    // Step 2: Login
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: userData.email,
      password: userData.password
    });
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');

    // Step 3: Get areas
    console.log('📋 Getting areas...');
    const areasResponse = await axios.get(`${API_BASE_URL}/areas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const areas = areasResponse.data;
    console.log(`✅ Found ${areas.length} areas`);

    // Step 4: Test with first area - submit specific pattern of answers
    const firstArea = areas[0];
    console.log(`🎯 Testing with area: ${firstArea.name}`);

    // Get questions for this area
    const questionsResponse = await axios.get(`${API_BASE_URL}/assessment/area/${firstArea.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const questions = questionsResponse.data;
    console.log(`📝 Found ${questions.length} questions`);

    // Create a specific pattern: 7 true, 3 false = 70% = 7.0 score
    const answers = questions.map((question, index) => ({
      questionId: question.id,
      value: index < 7 // First 7 are true, last 3 are false
    }));

    console.log('📤 Submitting answers (7 true, 3 false - expected score: 7.0)...');
    const submitResponse = await axios.post(`${API_BASE_URL}/answers/submit-area`, {
      areaId: firstArea.id,
      answers: answers
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const areaScore = submitResponse.data.areaScore;
    const globalScore = submitResponse.data.globalScore;

    console.log(`📊 Results:`);
    console.log(`   Area Score: ${areaScore}/10`);
    console.log(`   Global Score: ${globalScore}/10`);
    console.log(`   Expected Area Score: 7.0`);
    console.log(`   Expected Global Score: 7.0 (only one area answered)`);

    // Verify calculations
    if (Math.abs(areaScore - 7.0) < 0.01) {
      console.log('✅ Area score calculation is correct');
    } else {
      console.log('❌ Area score calculation is incorrect');
    }

    if (Math.abs(globalScore - 7.0) < 0.01) {
      console.log('✅ Global score calculation is correct');
    } else {
      console.log('❌ Global score calculation is incorrect');
    }

    // Step 5: Get LifeWheel state to verify persistence
    console.log('🔍 Verifying score persistence...');
    const lifeWheelResponse = await axios.get(`${API_BASE_URL}/lifewheel/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const persistedGlobalScore = lifeWheelResponse.data.globalScore;
    const persistedAreaScore = lifeWheelResponse.data.lifeAreas.find(
      area => area.areaId === firstArea.id
    )?.score;

    console.log(`💾 Persisted scores:`);
    console.log(`   Global Score: ${persistedGlobalScore}/10`);
    console.log(`   Area Score: ${persistedAreaScore}/10`);

    if (Math.abs(persistedGlobalScore - 7.0) < 0.01 && Math.abs(persistedAreaScore - 7.0) < 0.01) {
      console.log('✅ Score persistence is working correctly');
    } else {
      console.log('❌ Score persistence has issues');
    }

    console.log('\n🏁 Score calculation test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testScoreCalculation();
