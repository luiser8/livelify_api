// Test script for GTD Projects functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testGTDProjectsFlow() {
  console.log('🎯 Testing GTD Projects Flow');
  console.log('============================');

  try {
    // Step 1: Register user and create LifeWheel
    const timestamp = Date.now();
    const userData = {
      email: `testuser_${timestamp}@example.com`,
      password: 'TestPassword123!',
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Test Street',
      phone: '+1234567890'
    };

    console.log('📝 Step 1: Registering user and creating LifeWheel...');
    const registerResponse = await axios.post(`${API_BASE_URL}/users/register`, userData);
    const userId = registerResponse.data.id;
    const lifeWheelAreas = registerResponse.data.lifeWheel.lifeAreas;
    
    console.log(`✅ User registered: ${userId}`);
    console.log(`✅ LifeWheel created with ${lifeWheelAreas.length} areas`);

    // Step 2: Login
    console.log('🔐 Step 2: Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: userData.email,
      password: userData.password
    });
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');

    // Step 3: Submit some answers to have scores in areas
    console.log('📊 Step 3: Submitting answers to create area scores...');
    
    // Get areas to get questions
    const areasResponse = await axios.get(`${API_BASE_URL}/areas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const areas = areasResponse.data;
    
    // Submit answers for the first area
    const firstArea = areas[0];
    const questionsResponse = await axios.get(`${API_BASE_URL}/assessment/area/${firstArea.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const questions = questionsResponse.data;
    
    const answers = questions.map((question, index) => ({
      questionId: question.id,
      value: index < 7 // 7 true, 3 false = 7.0 score
    }));

    await axios.post(`${API_BASE_URL}/answers/submit-area`, {
      areaId: firstArea.id,
      answers: answers
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Submitted answers for area: ${firstArea.name}`);

    // Step 4: Get updated LifeWheel to get LifeWheelArea IDs
    console.log('🔍 Step 4: Getting updated LifeWheel...');
    const lifeWheelResponse = await axios.get(`${API_BASE_URL}/lifewheel/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const updatedLifeAreas = lifeWheelResponse.data.lifeAreas;
    console.log(`✅ Retrieved LifeWheel with ${updatedLifeAreas.length} areas`);

    // Step 5: Create projects from different LifeWheelAreas
    console.log('🚀 Step 5: Creating GTD projects from LifeWheelAreas...');
    
    const projectsToCreate = [
      {
        lifeWheelAreaId: updatedLifeAreas[0].id, // First area
        title: 'Improve Physical Fitness',
        description: 'A comprehensive plan to get in better shape through exercise and nutrition',
        startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endDate: new Date(Date.now() + 86400000 * 90).toISOString(), // 90 days from now
      },
      {
        lifeWheelAreaId: updatedLifeAreas[1].id, // Second area
        title: 'Learn New Programming Language',
        description: 'Master TypeScript and advanced JavaScript concepts',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 60).toISOString(), // 60 days from now
      },
      {
        lifeWheelAreaId: updatedLifeAreas[2].id, // Third area
        title: 'Build Emergency Fund',
        description: 'Save $10,000 for emergency expenses',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 365).toISOString(), // 1 year from now
      }
    ];

    const createdProjects = [];
    
    for (let i = 0; i < projectsToCreate.length; i++) {
      const projectData = projectsToCreate[i];
      
      console.log(`  📋 Creating project: ${projectData.title}...`);
      
      const projectResponse = await axios.post(`${API_BASE_URL}/projects/from-lifewheel-area`, projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      createdProjects.push(projectResponse.data);
      console.log(`  ✅ Project created: ${projectResponse.data.project.title}`);
      console.log(`     - Project ID: ${projectResponse.data.project.id}`);
      console.log(`     - Status: ${projectResponse.data.project.status}`);
      console.log(`     - Detail Status: ${projectResponse.data.detail.status}`);
    }

    // Step 6: Get all user projects
    console.log('📋 Step 6: Retrieving all user projects...');
    const userProjectsResponse = await axios.get(`${API_BASE_URL}/projects/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const userProjects = userProjectsResponse.data;
    console.log(`✅ Retrieved ${userProjects.totalProjects} projects`);
    console.log(`   - Active: ${userProjects.activeProjects}`);
    console.log(`   - Completed: ${userProjects.completedProjects}`);
    
    console.log('\n📊 Project Details:');
    userProjects.projects.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.title}`);
      console.log(`      - Status: ${project.status}`);
      console.log(`      - LifeWheelArea: ${project.lifeWheelAreaId}`);
      if (project.detail) {
        console.log(`      - Start Date: ${new Date(project.detail.startDate).toLocaleDateString()}`);
        console.log(`      - End Date: ${new Date(project.detail.endDate).toLocaleDateString()}`);
        console.log(`      - Progress: ${project.detail.progressPercentage}%`);
      }
      console.log('');
    });

    // Step 7: Verify project-area relationships
    console.log('🔗 Step 7: Verifying project-area relationships...');
    
    let relationshipsValid = true;
    for (const project of userProjects.projects) {
      const relatedArea = updatedLifeAreas.find(area => area.id === project.lifeWheelAreaId);
      if (relatedArea) {
        console.log(`   ✅ Project "${project.title}" correctly linked to area "${relatedArea.areaName}"`);
      } else {
        console.log(`   ❌ Project "${project.title}" has invalid area relationship`);
        relationshipsValid = false;
      }
    }

    console.log('\n🏁 GTD Projects Flow Test Results:');
    console.log('=====================================');
    console.log(`✅ User registration and LifeWheel creation: SUCCESS`);
    console.log(`✅ Area answers and scoring: SUCCESS`);
    console.log(`✅ Project creation from LifeWheelAreas: SUCCESS (${createdProjects.length} projects)`);
    console.log(`✅ Project retrieval: SUCCESS (${userProjects.totalProjects} projects found)`);
    console.log(`✅ Project-area relationships: ${relationshipsValid ? 'SUCCESS' : 'FAILED'}`);
    
    if (relationshipsValid && userProjects.totalProjects === createdProjects.length) {
      console.log('\n🎉 All tests passed! GTD Projects functionality is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the implementation.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testGTDProjectsFlow();
