const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'testuser@example.com',
  password: 'TestPassword123!',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
  address: '123 Test Street',
};

async function testCompleteProfile() {
  console.log('🧪 Testing Complete User Profile Endpoint (/users/me)');
  console.log('=' .repeat(60));

  try {
    // Step 1: Register or login user
    console.log('\n📝 Step 1: Authenticating user...');
    let authToken;
    
    try {
      // Try to login first
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password,
      });
      authToken = loginResponse.data.accessToken;
      console.log('✅ User logged in successfully');
    } catch (loginError) {
      // If login fails, register new user
      console.log('👤 User not found, registering new user...');
      const registerResponse = await axios.post(`${BASE_URL}/users/register`, TEST_USER);
      
      // Login with new user
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password,
      });
      authToken = loginResponse.data.accessToken;
      console.log('✅ User registered and logged in successfully');
    }

    // Step 2: Test complete profile endpoint
    console.log('\n🔍 Step 2: Testing /users/me endpoint...');
    const profileResponse = await axios.get(`${BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    console.log('✅ Complete profile endpoint responded successfully');
    console.log(`📊 Response Status: ${profileResponse.status}`);

    // Step 3: Validate response structure
    console.log('\n🔍 Step 3: Validating response structure...');
    const profile = profileResponse.data;

    // Check main sections
    const requiredSections = ['user', 'contexts', 'summary'];
    const optionalSections = ['subscription', 'lifeWheel'];
    
    let validationPassed = true;

    // Validate required sections
    for (const section of requiredSections) {
      if (!profile.hasOwnProperty(section)) {
        console.log(`❌ Missing required section: ${section}`);
        validationPassed = false;
      } else {
        console.log(`✅ Required section present: ${section}`);
      }
    }

    // Check optional sections
    for (const section of optionalSections) {
      if (profile.hasOwnProperty(section)) {
        console.log(`✅ Optional section present: ${section}`);
      } else {
        console.log(`ℹ️  Optional section not present: ${section}`);
      }
    }

    // Validate user section
    if (profile.user) {
      const userFields = ['id', 'email', 'firstName', 'lastName'];
      const userValidation = userFields.every(field => profile.user.hasOwnProperty(field));
      console.log(`✅ User section validation: ${userValidation ? 'PASS' : 'FAIL'}`);
      
      if (userValidation) {
        console.log(`   📧 Email: ${profile.user.email}`);
        console.log(`   👤 Name: ${profile.user.firstName} ${profile.user.lastName}`);
      }
    }

    // Validate contexts section
    if (Array.isArray(profile.contexts)) {
      console.log(`✅ Contexts is array with ${profile.contexts.length} items`);
      if (profile.contexts.length > 0) {
        const contextFields = ['name', 'createdAt', 'updatedAt'];
        const contextValidation = contextFields.every(field => 
          profile.contexts[0].hasOwnProperty(field)
        );
        console.log(`✅ Context structure validation: ${contextValidation ? 'PASS' : 'FAIL'}`);
      }
    } else {
      console.log('❌ Contexts is not an array');
      validationPassed = false;
    }

    // Validate summary section
    if (profile.summary) {
      const summaryFields = ['totalProjects', 'totalGoals', 'totalActions', 'completedGoals', 'completedActions', 'overdueActions'];
      const summaryValidation = summaryFields.every(field => 
        profile.summary.hasOwnProperty(field) && typeof profile.summary[field] === 'number'
      );
      console.log(`✅ Summary section validation: ${summaryValidation ? 'PASS' : 'FAIL'}`);
      
      if (summaryValidation) {
        console.log(`   📊 Projects: ${profile.summary.totalProjects}`);
        console.log(`   🎯 Goals: ${profile.summary.totalGoals} (${profile.summary.completedGoals} completed)`);
        console.log(`   ⚡ Actions: ${profile.summary.totalActions} (${profile.summary.completedActions} completed, ${profile.summary.overdueActions} overdue)`);
      }
    }

    // Validate subscription section (if present)
    if (profile.subscription) {
      const subscriptionFields = ['id', 'planName', 'price', 'isActive', 'startDate'];
      const subscriptionValidation = subscriptionFields.every(field => 
        profile.subscription.hasOwnProperty(field)
      );
      console.log(`✅ Subscription section validation: ${subscriptionValidation ? 'PASS' : 'FAIL'}`);
      
      if (subscriptionValidation) {
        console.log(`   💳 Plan: ${profile.subscription.planName} ($${profile.subscription.price})`);
        console.log(`   ✅ Active: ${profile.subscription.isActive}`);
      }
    }

    // Validate lifeWheel section (if present)
    if (profile.lifeWheel) {
      const lifeWheelFields = ['id', 'globalScore', 'lifeAreas'];
      const lifeWheelValidation = lifeWheelFields.every(field => 
        profile.lifeWheel.hasOwnProperty(field)
      );
      console.log(`✅ LifeWheel section validation: ${lifeWheelValidation ? 'PASS' : 'FAIL'}`);
      
      if (lifeWheelValidation) {
        console.log(`   🎯 Global Score: ${profile.lifeWheel.globalScore}`);
        console.log(`   📊 Life Areas: ${profile.lifeWheel.lifeAreas.length}`);
        
        // Check life areas structure
        if (profile.lifeWheel.lifeAreas.length > 0) {
          const areaFields = ['id', 'areaId', 'areaName', 'score', 'projects'];
          const areaValidation = areaFields.every(field => 
            profile.lifeWheel.lifeAreas[0].hasOwnProperty(field)
          );
          console.log(`   ✅ Life Area structure validation: ${areaValidation ? 'PASS' : 'FAIL'}`);
        }
      }
    }

    // Step 4: Performance check
    console.log('\n⏱️  Step 4: Performance metrics...');
    const responseTime = profileResponse.headers['x-response-time'] || 'N/A';
    console.log(`📈 Response time: ${responseTime}`);
    console.log(`📦 Response size: ${JSON.stringify(profile).length} bytes`);

    // Final result
    console.log('\n🎉 Test Results:');
    console.log('=' .repeat(40));
    console.log(`✅ Endpoint accessible: YES`);
    console.log(`✅ Response structure: ${validationPassed ? 'VALID' : 'INVALID'}`);
    console.log(`✅ Data completeness: ${Object.keys(profile).length}/5 sections`);
    
    if (validationPassed) {
      console.log('\n🎊 All tests passed! The /users/me endpoint is working correctly.');
    } else {
      console.log('\n⚠️  Some validations failed. Please check the response structure.');
    }

    // Pretty print a sample of the response
    console.log('\n📋 Sample Response Structure:');
    console.log('-' .repeat(40));
    const sampleResponse = {
      user: profile.user ? {
        id: profile.user.id ? 'UUID' : 'missing',
        email: profile.user.email ? 'email@example.com' : 'missing',
        firstName: profile.user.firstName || 'missing',
        lastName: profile.user.lastName || 'missing',
      } : 'missing',
      subscription: profile.subscription ? 'present' : 'not present',
      contexts: `array[${profile.contexts?.length || 0}]`,
      lifeWheel: profile.lifeWheel ? `present (${profile.lifeWheel.lifeAreas?.length || 0} areas)` : 'not present',
      summary: profile.summary ? 'present' : 'missing',
    };
    console.log(JSON.stringify(sampleResponse, null, 2));

  } catch (error) {
    console.error('❌ Test failed with error:');
    console.error('Error details:', error.response?.data || error.message);
    console.error('Status code:', error.response?.status || 'N/A');
  }
}

// Run the test
testCompleteProfile().then(() => {
  console.log('\n🏁 Test completed');
}).catch((error) => {
  console.error('💥 Test script failed:', error.message);
});
