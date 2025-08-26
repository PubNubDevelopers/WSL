// Surfer Odds Demo Data - 200+ Real-time updates over 18 minutes
// Comprehensive market simulation with frequent odds, conditions, and betting changes

const generateTimelinedUpdates = () => {
  const updates = [];
  let timeMs = 3000; // Start at 3 seconds

  // Generate 200 updates over 18 minutes (1080 seconds)
  // Average update every ~5.4 seconds
  for (let i = 0; i < 200; i++) {
    const updateType = i % 3; // Cycle through update types
    const surferIndex = i % 6; // Cycle through surfers
    
    const surfers = [
      'griffin-colapinto', 'john-john-florence', 'kelly-slater', 
      'gabriel-medina', 'carissa-moore', 'italo-ferreira'
    ];
    
    const baseWinRates = [73, 68, 65, 62, 58, 55];
    const baseBetOdds = ['+120', '+150', '+180', '+200', '+250', '+300'];
    
    // Create realistic fluctuations
    const timeVariation = Math.random() * 3000 + 2000; // 2-5 second intervals
    timeMs += timeVariation;
    
    const winRateFluctuation = (Math.random() - 0.5) * 8; // +/- 4% max
    const newWinRate = Math.max(30, Math.min(90, baseWinRates[surferIndex] + winRateFluctuation));
    
    const trends = ['up', 'down', 'stable'];
    const forms = ['hot', 'warm', 'cold'];
    const conditions = ['excellent', 'good', 'fair', 'poor'];
    
    if (updateType === 0) {
      // Odds update
      updates.push({
        timeSinceVideoStartedInMs: Math.round(timeMs),
        persistInHistory: true,
        action: {
          channel: "wsl.odds.live",
          data: {
            type: "oddsUpdate",
            data: [{
              surferId: surfers[surferIndex],
              winRate: Math.round(newWinRate),
              currentForm: forms[i % 3],
              conditionRating: conditions[i % 4],
              trend: trends[Math.floor(Math.random() * 3)],
              ...(Math.random() > 0.7 && { pastPerformance: Math.round(60 + Math.random() * 35) })
            }]
          }
        }
      });
    } else if (updateType === 1) {
      // ASD betting odds update
      const oddVariation = Math.round((Math.random() - 0.5) * 30); // +/- 15 variation
      const baseOdd = parseInt(baseBetOdds[surferIndex].substring(1));
      const newOdd = Math.max(50, baseOdd + oddVariation);
      
      updates.push({
        timeSinceVideoStartedInMs: Math.round(timeMs),
        persistInHistory: true,
        action: {
          channel: "wsl.odds.asd-feed",
          data: {
            type: "asdOddsUpdate",
            data: [{
              surferId: surfers[surferIndex],
              betOdds: `+${newOdd}`,
              trend: trends[Math.floor(Math.random() * 3)]
            }]
          }
        }
      });
    } else {
      // Conditions update (every ~15th update)
      if (i % 15 === 0) {
        const waveHeights = ['6-8ft', '7-9ft', '8-10ft', '9-11ft', '10-12ft', '12-14ft', '14-16ft'];
        const windDirections = ['Offshore', 'Light Offshore', 'Cross-shore', 'Onshore', 'Strong Onshore'];
        const difficulties = ['intermediate', 'advanced', 'expert-only'];
        
        updates.push({
          timeSinceVideoStartedInMs: Math.round(timeMs),
          persistInHistory: true,
          action: {
            channel: "wsl.conditions.updates",
            data: {
              type: "conditionsUpdate",
              data: {
                waveHeight: waveHeights[Math.floor(Math.random() * waveHeights.length)],
                waveQuality: Math.round((6 + Math.random() * 4) * 10) / 10,
                windDirection: windDirections[Math.floor(Math.random() * windDirections.length)],
                windSpeed: `${Math.round(5 + Math.random() * 20)}-${Math.round(10 + Math.random() * 25)}mph`,
                tide: ['Low', 'Mid Rising', 'High', 'Mid Outgoing'][Math.floor(Math.random() * 4)],
                waterTemp: `${Math.round(72 + Math.random() * 6)}°F`,
                difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
                location: "Pipeline, Hawaii"
              }
            }
          }
        });
      } else {
        // Skip this iteration to maintain timing
        timeMs -= timeVariation;
        continue;
      }
    }
  }
  
  return updates.sort((a, b) => a.timeSinceVideoStartedInMs - b.timeSinceVideoStartedInMs);
};

exports.surferOddsUpdates = generateTimelinedUpdates();

// Quick demo version with key highlights
exports.quickOddsDemo = [
  {
    timeSinceVideoStartedInMs: 2000,
    persistInHistory: true,
    action: {
      channel: "wsl.odds.live",
      data: {
        type: "oddsUpdate",
        data: [{
          surferId: "griffin-colapinto",
          winRate: 76,
          trend: "up"
        }]
      }
    }
  },
  {
    timeSinceVideoStartedInMs: 4000,
    persistInHistory: true,
    action: {
      channel: "wsl.odds.asd-feed",
      data: {
        type: "asdOddsUpdate", 
        data: [{
          surferId: "griffin-colapinto",
          betOdds: "+105",
          trend: "up"
        }]
      }
    }
  },
  {
    timeSinceVideoStartedInMs: 6000,
    persistInHistory: true,
    action: {
      channel: "wsl.conditions.updates",
      data: {
        type: "conditionsUpdate",
        data: {
          waveHeight: "10-12ft",
          waveQuality: 10,
          windDirection: "Perfect Offshore",
          windSpeed: "5-8mph",
          tide: "Perfect Mid",
          waterTemp: "76°F", 
          difficulty: "expert-only",
          location: "Pipeline, Hawaii"
        }
      }
    }
  }
];
