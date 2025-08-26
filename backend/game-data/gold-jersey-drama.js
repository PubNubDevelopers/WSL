// ⚠️  NOTICE: This is the STANDALONE version of Gold Jersey Drama
// 🚀 PREFERRED: Use the integrated version through main backend system!
//    - Start backend: npm run generator
//    - Go to: http://localhost:3000/test-console  
//    - Click: "🏆 Gold Jersey Competition Drama (26s)"
//
// This standalone script is kept for debugging/backup purposes.

const PubNub = require('pubnub');
const config = require('../config.json');

// Check if PubNub keys are configured
if (!config.publishKey || !config.subscribeKey) {
  console.error('❌ ERROR: PubNub keys not configured!');
  console.log('📝 Please add your PubNub keys to backend/config.json:');
  console.log(JSON.stringify({
    publishKey: "your-publish-key-here",
    subscribeKey: "your-subscribe-key-here"
  }, null, 2));
  process.exit(1);
}

const pubnub = new PubNub({
  publishKey: config.publishKey,
  subscribeKey: config.subscribeKey,
  userId: 'gold-jersey-generator'
});

// Competition participants with their current standings
const participants = [
  {
    userId: 'surfer-hawk-2024',
    username: 'SurferHawk2024',
    avatar: '/avatars/m/15.jpg',
    currentRank: 3,
    totalPoints: 2847,
    weeklyWins: 1,
    category: 'weekly'
  },
  {
    userId: 'pipeline-queen',
    username: 'PipelineQueen',
    avatar: '/avatars/f/08.jpg', 
    currentRank: 1,
    totalPoints: 3120,
    weeklyWins: 2,
    category: 'weekly'
  },
  {
    userId: 'wave-wizard-griffin',
    username: 'WaveWizardGriffin',
    avatar: '/avatars/m/03.jpg',
    currentRank: 2,
    totalPoints: 2993,
    weeklyWins: 2,
    category: 'weekly'
  },
  {
    userId: 'aloha-ace',
    username: 'AlohaAce',
    avatar: '/avatars/m/12.jpg',
    currentRank: 4,
    totalPoints: 2756,
    weeklyWins: 1,
    category: 'weekly'
  },
  {
    userId: 'surf-oracle-maui',
    username: 'SurfOracleMaui',
    avatar: '/avatars/f/12.jpg',
    currentRank: 5,
    totalPoints: 2698,
    weeklyWins: 0,
    category: 'weekly'
  }
];

// Achievement definitions
const achievements = [
  {
    id: 'comeback-king',
    name: 'Comeback King',
    description: 'Rose from 5th to 1st place in final hour',
    icon: '🚀',
    rarity: 'epic',
    category: 'fantasy'
  },
  {
    id: 'prediction-perfectionist',
    name: 'Prediction Perfectionist', 
    description: 'Perfect prediction accuracy in final week',
    icon: '🎯',
    rarity: 'legendary',
    category: 'prediction'
  },
  {
    id: 'clutch-performer',
    name: 'Clutch Performer',
    description: 'Scored highest points in pressure moments',
    icon: '💎',
    rarity: 'epic',
    category: 'fantasy'
  }
];

// Gold Jersey definitions
const goldJerseys = [
  {
    id: 'weekly-pipeline-champion',
    eventName: 'Pipeline Masters - Week 7',
    location: 'Pipeline, Hawaii',
    date: Date.now(),
    category: 'weekly-winner',
    specialAchievement: 'Perfect final day performance'
  },
  {
    id: 'prediction-master-weekly',
    eventName: 'Pipeline Masters - Week 7',
    location: 'Pipeline, Hawaii', 
    date: Date.now(),
    category: 'prediction-master',
    specialAchievement: '100% accuracy in final predictions'
  }
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function publishMessage(channel, message) {
  try {
    console.log(`📡 Publishing to ${channel}:`, message);
    await pubnub.publish({
      channel: channel,
      message: message
    });
    await sleep(500); // Small delay between messages
  } catch (error) {
    console.error('❌ Publish error:', error);
  }
}

async function runCompetitionDrama() {
  console.log('🏄‍♂️ Starting Competition Conclusion Drama...\n');
  console.log('🎬 SCENARIO: Final 5 minutes of Pipeline Masters Week 7 Competition');
  console.log('📊 Current Standings: PipelineQueen leads, but the gap is closing...\n');

  // Phase 1: Show current standings (3 seconds)
  console.log('📋 Phase 1: Current Leaderboard (3s)');
  for (let i = 0; i < participants.length; i++) {
    const participant = participants[i];
    await publishMessage('wsl.profiles.winners', {
      type: 'leaderboardUpdate',
      period: 'weekly',
      timestamp: Date.now(),
      data: participants.map((p, index) => ({
        ...p,
        rank: index + 1
      }))
    });
    break; // Just send once
  }
  await sleep(3000);

  // Phase 2: Dramatic point updates and rank changes (8 seconds)
  console.log('⚡ Phase 2: Final Surge - Rankings Shifting! (8s)');
  
  // SurferHawk2024 makes a huge jump
  participants[0].totalPoints = 3087; // Jumps ahead of WaveWizardGriffin
  participants[0].currentRank = 2;
  participants[2].currentRank = 3;
  
  await publishMessage('wsl.profiles.winners', {
    type: 'leaderboardUpdate', 
    period: 'weekly',
    timestamp: Date.now(),
    data: [
      participants[1], // PipelineQueen still #1
      participants[0], // SurferHawk2024 now #2  
      participants[2], // WaveWizardGriffin drops to #3
      participants[3], // AlohaAce #4
      participants[4]  // SurfOracleMaui #5
    ]
  });
  await sleep(2000);

  // AlohaAce makes surprise surge to #2!
  participants[3].totalPoints = 3156;
  participants[3].currentRank = 2;
  participants[0].currentRank = 3;

  await publishMessage('wsl.profiles.winners', {
    type: 'leaderboardUpdate',
    period: 'weekly', 
    timestamp: Date.now(),
    data: [
      participants[1], // PipelineQueen still #1
      participants[3], // AlohaAce surges to #2!
      participants[0], // SurferHawk2024 drops to #3
      participants[2], // WaveWizardGriffin #4
      participants[4]  // SurfOracleMaui #5
    ]
  });
  await sleep(3000);

  // DRAMATIC FINALE: SurfOracleMaui comes from behind to WIN!
  console.log('🚀 INCREDIBLE! SurfOracleMaui charging from 5th to 1st!');
  participants[4].totalPoints = 3289; // MASSIVE final surge
  participants[4].currentRank = 1;
  participants[1].currentRank = 2; // PipelineQueen drops to #2

  await publishMessage('wsl.profiles.winners', {
    type: 'leaderboardUpdate',
    period: 'weekly',
    timestamp: Date.now(), 
    data: [
      {...participants[4], rank: 1}, // SurfOracleMaui WINS!
      {...participants[1], rank: 2}, // PipelineQueen #2
      {...participants[3], rank: 3}, // AlohaAce #3
      {...participants[0], rank: 4}, // SurferHawk2024 #4
      {...participants[2], rank: 5}  // WaveWizardGriffin #5
    ]
  });
  await sleep(3000);

  // Phase 3: Achievement Unlocks (5 seconds)
  console.log('🎯 Phase 3: Achievement Unlocks! (5s)');
  
  // SurfOracleMaui gets the epic "Comeback King" achievement
  await publishMessage('wsl.profiles.achievements', {
    type: 'achievementUnlocked',
    userId: 'surf-oracle-maui',
    username: 'SurfOracleMaui',
    timestamp: Date.now(),
    data: achievements[0] // Comeback King
  });
  await sleep(2000);

  // PipelineQueen gets "Clutch Performer" for maintaining 2nd
  await publishMessage('wsl.profiles.achievements', {
    type: 'achievementUnlocked',
    userId: 'pipeline-queen',
    username: 'PipelineQueen', 
    timestamp: Date.now(),
    data: achievements[2] // Clutch Performer
  });
  await sleep(3000);

  // Phase 4: Gold Jersey Awards! (7 seconds)
  console.log('🏆 Phase 4: GOLD JERSEY CEREMONY! (7s)');

  // Award Gold Jersey to SurfOracleMaui (Weekly Winner)
  const winnerJersey = {
    ...goldJerseys[0],
    points: participants[4].totalPoints,
    rank: 1
  };
  
  await publishMessage('wsl.profiles.winners', {
    type: 'goldJerseyAwarded',
    userId: 'surf-oracle-maui',
    username: 'SurfOracleMaui',
    timestamp: Date.now(),
    data: winnerJersey
  });
  await sleep(3000);

  // Award special Prediction Master jersey to PipelineQueen for perfect accuracy
  await publishMessage('wsl.profiles.achievements', {
    type: 'achievementUnlocked',
    userId: 'pipeline-queen',
    username: 'PipelineQueen',
    timestamp: Date.now(),
    data: achievements[1] // Prediction Perfectionist (legendary!)
  });
  await sleep(2000);

  const predictionJersey = {
    ...goldJerseys[1],
    points: participants[1].totalPoints,
    rank: 2
  };

  await publishMessage('wsl.profiles.winners', {
    type: 'goldJerseyAwarded', 
    userId: 'pipeline-queen',
    username: 'PipelineQueen',
    timestamp: Date.now(),
    data: predictionJersey
  });
  await sleep(2000);

  // Phase 5: Community Celebration (3 seconds)
  console.log('🎉 Phase 5: Community Celebration! (3s)');
  
  await publishMessage('wsl.profiles.winners', {
    type: 'competitionComplete',
    event: 'Pipeline Masters - Week 7',
    timestamp: Date.now(),
    data: {
      winner: {
        userId: 'surf-oracle-maui',
        username: 'SurfOracleMaui',
        achievement: 'From 5th to 1st - Greatest comeback in WSL history!'
      },
      totalParticipants: 2847,
      avgPoints: 1456,
      topScore: 3289
    }
  });

  console.log('\n🎬 DRAMA COMPLETE!');
  console.log('📊 Final Results:');
  console.log('  🥇 SurfOracleMaui - 3,289 points (Comeback King!)');
  console.log('  🥈 PipelineQueen - 3,120 points (Prediction Perfectionist!)'); 
  console.log('  🥉 AlohaAce - 3,156 points');
  console.log('\n🏆 Gold Jerseys Awarded:');
  console.log('  - Weekly Champion: SurfOracleMaui');
  console.log('  - Prediction Master: PipelineQueen');
  console.log('\nThe Gold Jersey Widget should now be buzzing with activity! 🎉');
}

// Command line execution
if (require.main === module) {
  const scenario = process.argv[2] || 'drama';
  
  switch(scenario) {
    case 'drama':
      runCompetitionDrama();
      break;
    case 'quick':
      console.log('🚀 Quick demo: Just award a gold jersey');
      publishMessage('wsl.gold-jersey.winners', {
        type: 'goldJerseyAwarded',
        userId: 'demo-user',
        username: 'DemoSurfer',
        timestamp: Date.now(),
        data: {
          ...goldJerseys[0],
          points: 2500,
          rank: 1
        }
      });
      break;
    default:
      console.log('Usage: node gold-jersey-drama.js [drama|quick]');
  }
}

module.exports = { runCompetitionDrama };
