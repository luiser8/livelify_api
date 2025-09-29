const http = require('http');

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/v1${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Livelify API...\n');

  try {
    // Test 1: Basic endpoint
    console.log('1. Testing basic endpoint...');
    const basicTest = await testEndpoint('/');
    console.log(`   Status: ${basicTest.status}`);
    console.log(`   Response: ${basicTest.body.substring(0, 50)}...\n`);

    // Test 2: Swagger documentation
    console.log('2. Testing Swagger docs...');
    const swaggerTest = await testEndpoint('/docs');
    console.log(`   Status: ${swaggerTest.status}`);
    console.log(`   Content-Type: ${swaggerTest.headers['content-type']}\n`);

    // Test 3: Create user (should work - public endpoint)
    console.log('3. Testing user creation...');
    const createUserTest = await testEndpoint('/users', 'POST', {
      email: 'test@example.com',
      password: 'TestPass123!'
    });
    console.log(`   Status: ${createUserTest.status}`);
    console.log(`   Response: ${createUserTest.body}\n`);

    // Test 4: Protected endpoint without auth (should fail)
    console.log('4. Testing protected endpoint without auth...');
    const protectedTest = await testEndpoint('/users/profile/me');
    console.log(`   Status: ${protectedTest.status}`);
    console.log(`   Response: ${protectedTest.body}\n`);

    console.log('✅ API tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the API is running with: npm run start:dev');
    }
  }
}

runTests();
