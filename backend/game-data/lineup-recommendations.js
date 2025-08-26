// Lineup Analyzer Demo Data - AI-Powered Recommendations Timeline
// Triggers automatic lineup recommendations and surfer updates during demo

exports.lineupRecommendations = [
  {
    // Initial AI recommendations load
    timeSinceVideoStartedInMs: 3000,
    persistInHistory: true,
    action: {
      channel: "wsl.lineup.recommendations",
      data: {
        type: "refreshRecommendations"
      }
    }
  },

  {
    // Griffin Colapinto conditions boost after first wave
    timeSinceVideoStartedInMs: 5000, 
    persistInHistory: true,
    action: {
      channel: "wsl.lineup.recommendations",
      data: {
        type: "surferUpdate",
        surferId: "griffin-colapinto",
        updates: {
          conditionsBonus: 7.8, // Increased from 5.2
          formAdjustment: 12.1, // Increased from 8.1
          projectedPoints: 58.2, // Boosted projection
          expectedValue: 4.66, // Improved value
          weatherImpact: "very-positive"
        }
      }
    }
  },

  {
    // Kelly Slater momentum shift - negative form
    timeSinceVideoStartedInMs: 8500,
    persistInHistory: true, 
    action: {
      channel: "wsl.lineup.recommendations",
      data: {
        type: "surferUpdate",
        surferId: "kelly-slater",
        updates: {
          formAdjustment: 6.8, // Decreased from 12.4
          projectedPoints: 41.2, // Lower projection
          expectedValue: 4.63, // Still good value but lower
          riskScore: 72, // Increased risk
          weatherImpact: "negative"
        }
      }
    }
  },

  {
    // Generate fresh recommendations after conditions change
    timeSinceVideoStartedInMs: 9000,
    persistInHistory: true,
    action: {
      channel: "wsl.lineup.recommendations", 
      data: {
        type: "refreshRecommendations"
      }
    }
  },

  {
    // John John Florence consistent boost - Pipeline specialist
    timeSinceVideoStartedInMs: 12000,
    persistInHistory: true,
    action: {
      channel: "wsl.lineup.recommendations",
      data: {
        type: "surferUpdate", 
        surferId: "john-john-florence",
        updates: {
          conditionsBonus: 4.8, // Slight increase from 3.1
          formAdjustment: 5.7, // Better recent form
          projectedPoints: 52.1, // Higher floor
          downside: 41.2, // Increased floor
          weatherImpact: "positive"
        }
      }
    }
  },

  {
    // Carissa Moore sleeper alert - form trending up
    timeSinceVideoStartedInMs: 15000,
    persistInHistory: true,
    action: {
      channel: "wsl.lineup.recommendations",
      data: {
        type: "surferUpdate",
        surferId: "carissa-moore", 
        updates: {
          formAdjustment: 8.9, // Strong recent performances
          projectedPoints: 47.8, // Increased projection
          expectedValue: 4.88, // Great value play
          ownership: 16.3, // Lower ownership (contrarian)
          upside: 73.4, // Higher ceiling
          tags: ["sleeper-pick", "form-boost", "contrarian-play"]
        }
      }
    }
  },

  {
    // Final recommendations refresh before heat climax
    timeSinceVideoStartedInMs: 17000,
    persistInHistory: true,
    action: {
      channel: "wsl.lineup.recommendations",
      data: {
        type: "refreshRecommendations"
      }
    }
  },

  {
    // Late-breaking Medina condition adjustment
    timeSinceVideoStartedInMs: 19000,
    persistInHistory: true,
    action: {
      channel: "wsl.lineup.recommendations",
      data: {
        type: "surferUpdate",
        surferId: "gabriel-medina",
        updates: {
          conditionsBonus: 3.4, // Slight improvement
          formAdjustment: 1.8, // Form stabilized  
          projectedPoints: 46.3, // Modest increase
          matchupRating: "very-favorable", // Better wave selection
          weatherImpact: "positive"
        }
      }
    }
  }
];

// Quick demo version for shorter presentations
exports.lineupRecommendationsQuick = [
  {
    timeSinceVideoStartedInMs: 2000,
    persistInHistory: true,
    action: {
      channel: "wsl.lineup.recommendations",
      data: {
        type: "refreshRecommendations"  
      }
    }
  },
  {
    timeSinceVideoStartedInMs: 7000,
    persistInHistory: true,
    action: {
      channel: "wsl.lineup.recommendations",
      data: {
        type: "surferUpdate",
        surferId: "griffin-colapinto",
        updates: {
          projectedPoints: 58.2,
          expectedValue: 4.66,
          formAdjustment: 12.1
        }
      }
    }
  }
];

// Manual trigger for user optimization demo
exports.demoOptimizationRequest = {
  type: "optimizeLineup",
  preferences: {
    budget: 50000,
    riskPreference: "balanced", 
    selectedSurfers: ["griffin-colapinto"], // User locks in Griffin
    diversificationTarget: 60
  },
  userId: "demo-user-001"
};
