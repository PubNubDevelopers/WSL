// Fantasy Live Demo Data - Griffin Colapinto Power Surfer Scoring
// Generates real-time fantasy scoring updates with 2x multiplier

exports.fantasyLive = [
  {
    // Initial Griffin wave score - 7.5 → 15.0 with 2x multiplier
    timeSinceVideoStartedInMs: 2000,
    persistInHistory: true,
    action: {
      channel: "wsl.fantasy-live",
      data: {
        type: "powerSurferScore",
        originalScore: 7.5,
        newPosition: 12, // User moves from 15th to 12th
        surfer: "Griffin Colapinto",
        multiplier: 2
      }
    }
  },
  
  {
    // Leaderboard update after Griffin's first wave
    timeSinceVideoStartedInMs: 2500,
    persistInHistory: true,
    action: {
      channel: "wsl.fantasy-live",
      data: {
        type: "leaderboardUpdate",
        leaderboard: [
          { position: 1, name: "SurfKing2024", score: 87.3 },
          { position: 2, name: "PipelinePro", score: 84.1 },
          { position: 3, name: "WaveWizard", score: 82.6 },
          { position: 4, name: "BarrelRider", score: 78.9 },
          { position: 5, name: "TubeTime", score: 76.2 },
          { position: 6, name: "AirMaster", score: 74.1 },
          { position: 7, name: "WaveWarrior", score: 71.8 },
          { position: 8, name: "SurfSage", score: 68.5 },
          { position: 9, name: "PipeGuru", score: 65.3 },
          { position: 10, name: "WaveHunter", score: 62.7 },
          { position: 11, name: "SurfPhenom", score: 58.9 },
          { position: 12, name: "You", score: 38.4 }, // 23.4 + 15.0 = 38.4
          { position: 13, name: "TideRider", score: 55.4 },
          { position: 14, name: "BreakMaster", score: 51.2 },
          { position: 15, name: "WaveDancer", score: 47.8 },
          { position: 16, name: "SurfNewbie", score: 19.6 },
          { position: 17, name: "RookiePaddle", score: 16.3 },
          { position: 18, name: "LearningToSurf", score: 12.1 },
          { position: 19, name: "BeachBoy22", score: 8.7 },
          { position: 20, name: "FirstTimer", score: 5.2 }
        ]
      }
    }
  },

  {
    // Griffin's second wave - massive 8.7 → 17.4 with 2x multiplier
    timeSinceVideoStartedInMs: 8000,
    persistInHistory: true,
    action: {
      channel: "wsl.fantasy-live",
      data: {
        type: "powerSurferScore",
        originalScore: 8.7,
        newPosition: 8, // Big jump from 12th to 8th!
        surfer: "Griffin Colapinto",
        multiplier: 2
      }
    }
  },

  {
    // Updated leaderboard after Griffin's big wave
    timeSinceVideoStartedInMs: 8500,
    persistInHistory: true,
    action: {
      channel: "wsl.fantasy-live",
      data: {
        type: "leaderboardUpdate",
        leaderboard: [
          { position: 1, name: "SurfKing2024", score: 87.3 },
          { position: 2, name: "PipelinePro", score: 84.1 },
          { position: 3, name: "WaveWizard", score: 82.6 },
          { position: 4, name: "BarrelRider", score: 78.9 },
          { position: 5, name: "TubeTime", score: 76.2 },
          { position: 6, name: "AirMaster", score: 74.1 },
          { position: 7, name: "WaveWarrior", score: 71.8 },
          { position: 8, name: "You", score: 55.8 }, // 38.4 + 17.4 = 55.8
          { position: 9, name: "SurfSage", score: 68.5 },
          { position: 10, name: "PipeGuru", score: 65.3 },
          { position: 11, name: "WaveHunter", score: 62.7 },
          { position: 12, name: "SurfPhenom", score: 58.9 },
          { position: 13, name: "TideRider", score: 55.4 },
          { position: 14, name: "BreakMaster", score: 51.2 },
          { position: 15, name: "WaveDancer", score: 47.8 },
          { position: 16, name: "SurfNewbie", score: 19.6 },
          { position: 17, name: "RookiePaddle", score: 16.3 },
          { position: 18, name: "LearningToSurf", score: 12.1 },
          { position: 19, name: "BeachBoy22", score: 8.7 },
          { position: 20, name: "FirstTimer", score: 5.2 }
        ]
      }
    }
  },

  {
    // Griffin's final wave - perfect 9.1 → 18.2 with 2x multiplier
    timeSinceVideoStartedInMs: 15000,
    persistInHistory: true,
    action: {
      channel: "wsl.fantasy-live",
      data: {
        type: "powerSurferScore",
        originalScore: 9.1,
        newPosition: 5, // Massive jump to 5th place!
        surfer: "Griffin Colapinto",
        multiplier: 2
      }
    }
  },

  {
    // Final leaderboard showing Griffin's impact
    timeSinceVideoStartedInMs: 15500,
    persistInHistory: true,
    action: {
      channel: "wsl.fantasy-live",
      data: {
        type: "leaderboardUpdate",
        leaderboard: [
          { position: 1, name: "SurfKing2024", score: 87.3 },
          { position: 2, name: "PipelinePro", score: 84.1 },
          { position: 3, name: "WaveWizard", score: 82.6 },
          { position: 4, name: "BarrelRider", score: 78.9 },
          { position: 5, name: "You", score: 74.0 }, // 55.8 + 18.2 = 74.0 - Into top 5!
          { position: 6, name: "TubeTime", score: 76.2 },
          { position: 7, name: "AirMaster", score: 74.1 },
          { position: 8, name: "WaveWarrior", score: 71.8 },
          { position: 9, name: "SurfSage", score: 68.5 },
          { position: 10, name: "PipeGuru", score: 65.3 },
          { position: 11, name: "WaveHunter", score: 62.7 },
          { position: 12, name: "SurfPhenom", score: 58.9 },
          { position: 13, name: "TideRider", score: 55.4 },
          { position: 14, name: "BreakMaster", score: 51.2 },
          { position: 15, name: "WaveDancer", score: 47.8 },
          { position: 16, name: "SurfNewbie", score: 19.6 },
          { position: 17, name: "RookiePaddle", score: 16.3 },
          { position: 18, name: "LearningToSurf", score: 12.1 },
          { position: 19, name: "BeachBoy22", score: 8.7 },
          { position: 20, name: "FirstTimer", score: 5.2 }
        ]
      }
    }
  },

  {
    // WaveWizard (rival) scores to stay competitive - moves from 82.6 to 89.1
    timeSinceVideoStartedInMs: 18000,
    persistInHistory: true,
    action: {
      channel: "wsl.fantasy-live",
      data: {
        type: "rivalUpdate",
        rivalScore: 89.1, // WaveWizard scores to stay ahead
        rivalName: "WaveWizard"
      }
    }
  },

  {
    // Final leaderboard update showing WaveWizard's new score
    timeSinceVideoStartedInMs: 18500,
    persistInHistory: true,
    action: {
      channel: "wsl.fantasy-live",
      data: {
        type: "leaderboardUpdate",
        leaderboard: [
          { position: 1, name: "SurfKing2024", score: 87.3 },
          { position: 2, name: "WaveWizard", score: 89.1 }, // WaveWizard jumps to 2nd
          { position: 3, name: "PipelinePro", score: 84.1 },
          { position: 4, name: "BarrelRider", score: 78.9 },
          { position: 5, name: "You", score: 74.0 }, // You stay in 5th
          { position: 6, name: "TubeTime", score: 76.2 },
          { position: 7, name: "AirMaster", score: 74.1 },
          { position: 8, name: "WaveWarrior", score: 71.8 },
          { position: 9, name: "SurfSage", score: 68.5 },
          { position: 10, name: "PipeGuru", score: 65.3 },
          { position: 11, name: "WaveHunter", score: 62.7 },
          { position: 12, name: "SurfPhenom", score: 58.9 },
          { position: 13, name: "TideRider", score: 55.4 },
          { position: 14, name: "BreakMaster", score: 51.2 },
          { position: 15, name: "WaveDancer", score: 47.8 },
          { position: 16, name: "SurfNewbie", score: 19.6 },
          { position: 17, name: "RookiePaddle", score: 16.3 },
          { position: 18, name: "LearningToSurf", score: 12.1 },
          { position: 19, name: "BeachBoy22", score: 8.7 },
          { position: 20, name: "FirstTimer", score: 5.2 }
        ]
      }
    }
  }
];

// Alternative: Griffin-focused quick demo
exports.griffinDemo = [
  {
    timeSinceVideoStartedInMs: 1000,
    persistInHistory: true,
    action: {
      channel: "wsl.fantasy-live",
      data: {
        type: "powerSurferScore",
        originalScore: 8.5,
        newPosition: 8,
        surfer: "Griffin Colapinto",
        multiplier: 2
      }
    }
  },
  {
    timeSinceVideoStartedInMs: 6000,
    persistInHistory: true,
    action: {
      channel: "wsl.fantasy-live",
      data: {
        type: "powerSurferScore",
        originalScore: 9.2,
        newPosition: 4,
        surfer: "Griffin Colapinto",
        multiplier: 2
      }
    }
  }
];
