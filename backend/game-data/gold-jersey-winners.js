// Gold Jersey Winners & Achievement Timeline
// Creates competition finale drama for Winner Profile Widget

// Competition participants with their standings data
const participants = [
  {
    userId: 'surfer-hawk-2024',
    username: 'SurferHawk2024',
    avatar: '/avatars/m/15.jpg',
    totalPoints: 2847,
    weeklyWins: 1,
    rank: 3,
    goldJerseys: [
      {
        id: 'jersey-hawk-1',
        eventName: 'Sunset Beach Pro',
        location: 'Hawaii',
        date: Date.now() - (14 * 24 * 60 * 60 * 1000),
        category: 'weekly-winner',
        points: 2650,
        rank: 1
      }
    ],
    achievements: []
  },
  {
    userId: 'pipeline-queen',
    username: 'PipelineQueen',
    avatar: '/avatars/f/08.jpg', 
    totalPoints: 3120,
    weeklyWins: 2,
    rank: 1,
    goldJerseys: [
      {
        id: 'jersey-queen-1',
        eventName: 'Mavericks Challenge',
        location: 'California',
        date: Date.now() - (21 * 24 * 60 * 60 * 1000),
        category: 'prediction-master',
        points: 2890,
        rank: 1
      },
      {
        id: 'jersey-queen-2', 
        eventName: 'North Shore Classic',
        location: 'Hawaii',
        date: Date.now() - (7 * 24 * 60 * 60 * 1000),
        category: 'weekly-winner',
        points: 3001,
        rank: 1
      }
    ],
    achievements: []
  },
  {
    userId: 'wave-wizard-griffin',
    username: 'WaveWizardGriffin',
    avatar: '/avatars/m/03.jpg',
    totalPoints: 2993,
    weeklyWins: 2,
    rank: 2,
    goldJerseys: [
      {
        id: 'jersey-wizard-1',
        eventName: 'Teahupoo Masters',
        location: 'Tahiti',
        date: Date.now() - (28 * 24 * 60 * 60 * 1000),
        category: 'tournament-king',
        points: 2745,
        rank: 1
      }
    ],
    achievements: []
  },
  {
    userId: 'aloha-ace',
    username: 'AlohaAce',
    avatar: '/avatars/m/12.jpg',
    totalPoints: 2756,
    weeklyWins: 1,
    rank: 4,
    goldJerseys: [],
    achievements: []
  },
  {
    userId: 'surf-oracle-maui',
    username: 'SurfOracleMaui',
    avatar: '/avatars/f/12.jpg',
    totalPoints: 2698,
    weeklyWins: 0,
    rank: 5,
    goldJerseys: [], // Will get first jersey during the drama!
    achievements: []
  }
];

// Achievement definitions
const achievements = {
  comebackKing: {
    id: 'comeback-king',
    name: 'Comeback King',
    description: 'Rose from 5th to 1st place in final hour',
    icon: '🚀',
    rarity: 'epic',
    category: 'fantasy'
  },
  predictionPerfectionist: {
    id: 'prediction-perfectionist',
    name: 'Prediction Perfectionist', 
    description: 'Perfect prediction accuracy in final week',
    icon: '🎯',
    rarity: 'legendary',
    category: 'prediction'
  },
  clutchPerformer: {
    id: 'clutch-performer',
    name: 'Clutch Performer',
    description: 'Scored highest points in pressure moments',
    icon: '💎',
    rarity: 'epic',
    category: 'fantasy'
  }
};

// Gold Jersey definitions
const goldJerseys = {
  weeklyChampion: {
    id: 'weekly-pipeline-champion',
    eventName: 'Pipeline Masters - Week 7',
    location: 'Pipeline, Hawaii',
    date: Date.now(),
    category: 'weekly-winner',
    specialAchievement: 'Perfect final day performance'
  },
  predictionMaster: {
    id: 'prediction-master-weekly',
    eventName: 'Pipeline Masters - Week 7',
    location: 'Pipeline, Hawaii', 
    date: Date.now(),
    category: 'prediction-master',
    specialAchievement: '100% accuracy in final predictions'
  }
};

// Timeline export for main backend integration  
// 🎯 Positioned at 17-18 minutes (1,020,000-1,080,000ms) as competition finale
exports.goldJerseyWinners = [
  // Phase 1: Current Standings - Competition entering final minutes
  {
    timeSinceVideoStartedInMs: 1020000, // 17 minutes
    persistInHistory: true,
    action: {
      channel: "wsl.profiles.winners",
      data: {
        type: "leaderboardUpdate",
        period: "weekly",
        timestamp: Date.now(),
        data: participants.map((p, index) => ({...p, rank: index + 1}))
      }
    }
  },

  // Phase 2: First ranking shift - SurferHawk2024 jumps ahead
  {
    timeSinceVideoStartedInMs: 1023000, // 17:03
    persistInHistory: true,
    action: {
      channel: "wsl.profiles.winners",
      data: {
        type: "leaderboardUpdate", 
        period: "weekly",
        timestamp: Date.now(),
        data: [
          {...participants[1], rank: 1}, // PipelineQueen still #1
          {...participants[0], totalPoints: 3087, rank: 2}, // SurferHawk2024 jumps to #2  
          {...participants[2], rank: 3}, // WaveWizardGriffin drops to #3
          {...participants[3], rank: 4}, // AlohaAce #4
          {...participants[4], rank: 5}  // SurfOracleMaui #5
        ]
      }
    }
  },

  // Phase 2: AlohaAce surprise surge to #2!
  {
    timeSinceVideoStartedInMs: 1025000, // 17:05
    persistInHistory: true,
    action: {
      channel: "wsl.profiles.winners",
      data: {
        type: "leaderboardUpdate",
        period: "weekly", 
        timestamp: Date.now(),
        data: [
          {...participants[1], rank: 1}, // PipelineQueen still #1
          {...participants[3], totalPoints: 3156, rank: 2}, // AlohaAce surges to #2!
          {...participants[0], totalPoints: 3087, rank: 3}, // SurferHawk2024 drops to #3
          {...participants[2], rank: 4}, // WaveWizardGriffin #4
          {...participants[4], rank: 5}  // SurfOracleMaui #5
        ]
      }
    }
  },

  // Phase 2: DRAMATIC FINALE - SurfOracleMaui comes from behind!
  {
    timeSinceVideoStartedInMs: 1028000, // 17:08
    persistInHistory: true,
    action: {
      channel: "wsl.profiles.winners",
      data: {
        type: "leaderboardUpdate",
        period: "weekly",
        timestamp: Date.now(), 
        data: [
          {...participants[4], totalPoints: 3289, rank: 1}, // SurfOracleMaui WINS!
          {...participants[1], rank: 2}, // PipelineQueen #2
          {...participants[3], totalPoints: 3156, rank: 3}, // AlohaAce #3
          {...participants[0], totalPoints: 3087, rank: 4}, // SurferHawk2024 #4
          {...participants[2], rank: 5}  // WaveWizardGriffin #5
        ]
      }
    }
  },

  // Phase 3: Achievement Unlock - SurfOracleMaui gets Comeback King
  {
    timeSinceVideoStartedInMs: 1031000, // 17:11
    persistInHistory: true,
    action: {
      channel: "wsl.profiles.achievements",
      data: {
        type: "achievementUnlocked",
        userId: "surf-oracle-maui",
        username: "SurfOracleMaui",
        timestamp: Date.now(),
        data: achievements.comebackKing
      }
    }
  },

  // Phase 3: Achievement Unlock - PipelineQueen gets Clutch Performer
  {
    timeSinceVideoStartedInMs: 1033000, // 17:13
    persistInHistory: true,
    action: {
      channel: "wsl.profiles.achievements",
      data: {
        type: "achievementUnlocked",
        userId: "pipeline-queen",
        username: "PipelineQueen", 
        timestamp: Date.now(),
        data: achievements.clutchPerformer
      }
    }
  },

  // Phase 4: Gold Jersey Award - SurfOracleMaui Weekly Winner
  {
    timeSinceVideoStartedInMs: 1036000, // 17:16
    persistInHistory: true,
    action: {
      channel: "wsl.profiles.winners",
      data: {
        type: "goldJerseyAwarded",
        userId: "surf-oracle-maui",
        username: "SurfOracleMaui",
        timestamp: Date.now(),
        data: {
          ...goldJerseys.weeklyChampion,
          points: 3289,
          rank: 1
        }
      }
    }
  },

  // Phase 4: Legendary Achievement - PipelineQueen gets Prediction Perfectionist
  {
    timeSinceVideoStartedInMs: 1038000, // 17:18
    persistInHistory: true,
    action: {
      channel: "wsl.profiles.achievements",
      data: {
        type: "achievementUnlocked",
        userId: "pipeline-queen",
        username: "PipelineQueen",
        timestamp: Date.now(),
        data: achievements.predictionPerfectionist
      }
    }
  },

  // Phase 4: Gold Jersey Award - PipelineQueen Prediction Master
  {
    timeSinceVideoStartedInMs: 1040000, // 17:20
    persistInHistory: true,
    action: {
      channel: "wsl.profiles.winners",
      data: {
        type: "goldJerseyAwarded", 
        userId: "pipeline-queen",
        username: "PipelineQueen",
        timestamp: Date.now(),
        data: {
          ...goldJerseys.predictionMaster,
          points: 3120,
          rank: 2
        }
      }
    }
  },

  // Phase 5: Competition Complete Celebration
  {
    timeSinceVideoStartedInMs: 1042000, // 17:22
    persistInHistory: true,
    action: {
      channel: "wsl.profiles.winners",
      data: {
        type: "competitionComplete",
        event: "Pipeline Masters - Week 7",
        timestamp: Date.now(),
        data: {
          winner: {
            userId: "surf-oracle-maui",
            username: "SurfOracleMaui",
            achievement: "From 5th to 1st - Greatest comeback in WSL history!"
          },
          totalParticipants: 2847,
          avgPoints: 1456,
          topScore: 3289
        }
      }
    }
  }
];

// Export for standalone drama script (backwards compatibility)
exports.runGoldJerseyDrama = async function(publishMessage) {
  console.log('🏄‍♂️ Running Gold Jersey Competition Drama...\n');
  
  for (let event of exports.goldJerseyWinners) {
    console.log(`📡 Publishing: ${event.action.data.type}`);
    await publishMessage(event.action.channel, event.action.data, event.persistInHistory);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🎬 Gold Jersey Drama Complete! 🏆');
};
