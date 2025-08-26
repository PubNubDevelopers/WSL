/**
 * Test Script for Lineup Optimizer Function
 * 
 * This script can be used to manually test the lineup optimization
 * by publishing test messages to the wsl.lineup.recommendations channel.
 * 
 * Usage: node testLineupOptimizer.js
 */

require('dotenv').config();
const PubNub = require('pubnub');

const pubnub = new PubNub({
  publishKey: process.env.PUBNUB_PUBLISH_KEY,
  subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,
  secretKey: process.env.PUBNUB_SECRET_KEY,
  userId: 'test-client',
});

// Test scenarios
const testScenarios = {
  // Test 1: Basic lineup optimization
  optimizeBalanced: {
    type: 'optimizeLineup',
    preferences: {
      budget: 50000,
      riskPreference: 'balanced',
      selectedSurfers: ['griffin-colapinto'],
      diversificationTarget: 60
    },
    userId: 'test-user-001'
  },

  // Test 2: Conservative optimization with budget constraint
  optimizeConservative: {
    type: 'optimizeLineup', 
    preferences: {
      budget: 45000, // Lower budget
      riskPreference: 'conservative',
      selectedSurfers: ['john-john-florence', 'gabriel-medina'],
      diversificationTarget: 80
    },
    userId: 'test-user-002'
  },

  // Test 3: Aggressive high-risk strategy
  optimizeAggressive: {
    type: 'optimizeLineup',
    preferences: {
      budget: 55000, // Higher budget
      riskPreference: 'aggressive', 
      selectedSurfers: ['kelly-slater', 'italo-ferreira'],
      diversificationTarget: 40
    },
    userId: 'test-user-003'
  },

  // Test 4: Surfer update
  updateGriffin: {
    type: 'surferUpdate',
    surferId: 'griffin-colapinto',
    updates: {
      projectedPoints: 60.5,
      expectedValue: 4.84,
      formAdjustment: 15.2,
      conditionsBonus: 8.1
    }
  },

  // Test 5: Refresh recommendations
  refresh: {
    type: 'refreshRecommendations'
  },

  // Test 6: Invalid budget (should trigger error)
  invalidBudget: {
    type: 'optimizeLineup',
    preferences: {
      budget: 25000, // Too low
      riskPreference: 'balanced',
      selectedSurfers: [],
      diversificationTarget: 60
    },
    userId: 'test-user-error'
  }
};

// Subscribe to see results
function subscribeToResults() {
  pubnub.subscribe({
    channels: ['wsl.lineup.recommendations', 'wsl.user.test-user-001.notifications', 'wsl.user.test-user-002.notifications', 'wsl.user.test-user-003.notifications']
  });

  pubnub.addListener({
    message: (messageEvent) => {
      console.log('\n🔔 RECEIVED MESSAGE:');
      console.log('Channel:', messageEvent.channel);
      console.log('Message:', JSON.stringify(messageEvent.message, null, 2));
      console.log('---');
    }
  });
}

// Run test scenario
async function runTest(scenarioName) {
  if (!testScenarios[scenarioName]) {
    console.error('❌ Unknown test scenario:', scenarioName);
    return;
  }

  const scenario = testScenarios[scenarioName];
  console.log(`🧪 Running test: ${scenarioName}`);
  console.log('Sending:', JSON.stringify(scenario, null, 2));

  try {
    const result = await pubnub.publish({
      channel: 'wsl.lineup.recommendations',
      message: scenario
    });

    console.log('✅ Message published successfully');
    console.log('Timetoken:', result.timetoken);
  } catch (error) {
    console.error('❌ Error publishing message:', error);
  }
}

// Run all tests in sequence
async function runAllTests() {
  console.log('🚀 Starting Lineup Optimizer Tests...\n');
  
  // Subscribe first
  subscribeToResults();
  
  // Wait a moment for subscription
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Run tests with delays
  const tests = [
    'refresh',
    'optimizeBalanced', 
    'updateGriffin',
    'optimizeConservative',
    'optimizeAggressive',
    'invalidBudget'
  ];

  for (const test of tests) {
    await runTest(test);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay between tests
  }

  console.log('\n✅ All tests completed. Watching for results...');
  console.log('Press Ctrl+C to exit');
}

// CLI interface
const command = process.argv[2];

if (command === 'all') {
  runAllTests();
} else if (command && testScenarios[command]) {
  subscribeToResults();
  setTimeout(() => runTest(command), 1000);
} else {
  console.log('🧪 WSL Lineup Optimizer Test Script');
  console.log('\nUsage:');
  console.log('  node testLineupOptimizer.js all                 # Run all tests');
  console.log('  node testLineupOptimizer.js [scenario]          # Run specific test');
  console.log('\nAvailable scenarios:');
  Object.keys(testScenarios).forEach(name => {
    console.log(`  - ${name}`);
  });
  console.log('\nExamples:');
  console.log('  node testLineupOptimizer.js optimizeBalanced');
  console.log('  node testLineupOptimizer.js updateGriffin');
  console.log('  node testLineupOptimizer.js refresh');
}
