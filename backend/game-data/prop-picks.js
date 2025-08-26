// WSL Surf Prop Picks - Real-time predictions for surfing events
// These prop picks are designed for realistic surfing scenarios at Pipeline, Hawaii

// Timeline for a typical Pipeline heat (20 minutes):
// Heat starts at 0ms
// First wave at ~15s (15000ms) 
// Second wave at ~45s (45000ms)
// Third wave at ~85s (85000ms) 
// Fourth wave at ~130s (130000ms)
// Heat continues with waves every 30-60 seconds
// Heat ends at 1200000ms (20 minutes)

exports.propPicks = [
  // First prop pick - Who will catch the first wave?
  {
    timeSinceVideoStartedInMs: 5000,
    persistInHistory: true,
    action: {
      channel: "wsl.prop-pickem",
      data: {
        type: 'newProp',
        id: 'prop_001',
        question: 'Who will catch the first scoreable wave?',
        context: 'Pipeline is firing today - who has the best positioning?',
        options: [
          { text: 'John John Florence', value: 'jjf', odds: '2:1' },
          { text: 'Gabriel Medina', value: 'medina', odds: '3:1' },
          { text: 'Kelly Slater', value: 'slater', odds: '4:1' }
        ],
        timeWindow: 45,
        points: 15
      }
    }
  },
  
  // Result for first prop
  {
    timeSinceVideoStartedInMs: 50000,
    persistInHistory: false,
    action: {
      channel: "wsl.prop-pickem",
      data: {
        type: 'propResult',
        propId: 'prop_001',
        correctAnswer: 'jjf',
        points: 15
      }
    }
  },

  // Second prop pick - Wave size prediction
  {
    timeSinceVideoStartedInMs: 55000,
    persistInHistory: false,
    action: {
      channel: "wsl.prop-pickem",
      data: {
        type: 'newProp',
        id: 'prop_002',
        question: 'Will the next wave be barreled?',
        context: 'Pipeline is known for perfect barrels - is one coming?',
        options: [
          { text: 'Yes - Perfect barrel', value: 'barrel', odds: '2:1' },
          { text: 'Close but no barrel', value: 'close', odds: '3:2' },
          { text: 'No barrel at all', value: 'no_barrel', odds: '5:1' }
        ],
        timeWindow: 30,
        points: 10
      }
    }
  },

  {
    timeSinceVideoStartedInMs: 85000,
    persistInHistory: false,
    action: {
      channel: "wsl.prop-pickem",
      data: {
        type: 'propResult',
        propId: 'prop_002',
        correctAnswer: 'barrel',
        points: 10
      }
    }
  },

  // Third prop pick - Score prediction
  {
    timeSinceVideoStartedInMs: 90000,
    persistInHistory: false,
    action: {
      channel: "wsl.prop-pickem",
      data: {
        type: 'newProp',
        id: 'prop_003',
        question: 'What score will that wave get?',
        context: 'The judges are watching - how will they score that ride?',
        options: [
          { text: '8.0 - 10.0 (Excellent)', value: 'excellent', odds: '3:1' },
          { text: '6.0 - 7.9 (Good)', value: 'good', odds: '2:1' },
          { text: '0.1 - 5.9 (Average)', value: 'average', odds: '4:1' }
        ],
        timeWindow: 40,
        points: 12
      }
    }
  },

  {
    timeSinceVideoStartedInMs: 130000,
    persistInHistory: false,
    action: {
      channel: "wsl.prop-pickem",
      data: {
        type: 'propResult',
        propId: 'prop_003',
        correctAnswer: 'excellent',
        points: 12
      }
    }
  },

  // Fourth prop pick - Interference call
  {
    timeSinceVideoStartedInMs: 140000,
    persistInHistory: false,
    action: {
      channel: "wsl.prop-pickem",
      data: {
        type: 'newProp',
        id: 'prop_004',
        question: 'Will there be an interference call in this heat?',
        context: 'With multiple surfers out there, priority can get messy...',
        options: [
          { text: 'Yes - Interference called', value: 'interference', odds: '4:1' },
          { text: 'No interference', value: 'clean_heat', odds: '1:3' }
        ],
        timeWindow: 50,
        points: 8
      }
    }
  },

  {
    timeSinceVideoStartedInMs: 190000,
    persistInHistory: false,
    action: {
      channel: "wsl.prop-pickem",
      data: {
        type: 'propResult',
        propId: 'prop_004',
        correctAnswer: 'clean_heat',
        points: 8
      }
    }
  },

  // Fifth prop pick - Wipeout prediction
  {
    timeSinceVideoStartedInMs: 200000,
    persistInHistory: false,
    action: {
      channel: "wsl.prop-pickem",
      data: {
        type: 'newProp',
        id: 'prop_005',
        question: 'Will someone get wiped out on this next set?',
        context: 'Pipeline is unforgiving - big waves mean big consequences',
        options: [
          { text: 'Epic wipeout incoming!', value: 'wipeout', odds: '5:2' },
          { text: 'Everyone makes it safely', value: 'safe', odds: '1:2' }
        ],
        timeWindow: 35,
        points: 10
      }
    }
  },

  {
    timeSinceVideoStartedInMs: 235000,
    persistInHistory: false,
    action: {
      channel: "wsl.prop-pickem",
      data: {
        type: 'propResult',
        propId: 'prop_005',
        correctAnswer: 'wipeout',
        points: 10
      }
    }
  },

  // Sixth prop pick - Maneuver prediction
  {
    timeSinceVideoStartedInMs: 300000,
    persistInHistory: false,
    action: {
      channel: "wsl.prop-pickem",
      data: {
        type: 'newProp',
        id: 'prop_006',
        question: 'What will be the next standout maneuver?',
        context: 'The surfers are pushing limits - what will we see next?',
        options: [
          { text: 'Massive air reverse', value: 'air', odds: '6:1' },
          { text: 'Deep barrel ride', value: 'barrel_ride', odds: '3:1' },
          { text: 'Powerful cutback', value: 'cutback', odds: '2:1' },
          { text: 'Clean bottom turn', value: 'bottom_turn', odds: '3:2' }
        ],
        timeWindow: 45,
        points: 15
      }
    }
  },

  {
    timeSinceVideoStartedInMs: 345000,
    persistInHistory: false,
    action: {
      channel: "wsl.prop-pickem",
      data: {
        type: 'propResult',
        propId: 'prop_006',
        correctAnswer: 'barrel_ride',
        points: 15
      }
    }
  },

  // Seventh prop pick - Heat leader prediction
  {
    timeSinceVideoStartedInMs: 400000,
    persistInHistory: false,
    action: {
      channel: "wsl.prop-pickem",
      data: {
        type: 'newProp',
        id: 'prop_007',
        question: 'Who will be leading at the halfway point?',
        context: 'With 10 minutes left, who has the best two-wave total?',
        options: [
          { text: 'John John Florence', value: 'jjf_lead', odds: '2:1' },
          { text: 'Gabriel Medina', value: 'medina_lead', odds: '5:2' },
          { text: 'Kelly Slater', value: 'slater_lead', odds: '3:1' }
        ],
        timeWindow: 60,
        points: 18
      }
    }
  },

  {
    timeSinceVideoStartedInMs: 460000,
    persistInHistory: false,
    action: {
      channel: "wsl.prop-pickem",
      data: {
        type: 'propResult',
        propId: 'prop_007',
        correctAnswer: 'medina_lead',
        points: 18
      }
    }
  },

  // Eighth prop pick - Final minutes drama
  {
    timeSinceVideoStartedInMs: 600000,
    persistInHistory: false,
    action: {
      channel: "wsl.prop-pickem",
      data: {
        type: 'newProp',
        id: 'prop_008',
        question: 'Will anyone get a 9+ point ride in the final 5 minutes?',
        context: 'Crunch time at Pipeline - who will find that perfect wave?',
        options: [
          { text: 'Yes - Someone gets 9+', value: 'nine_plus', odds: '4:1' },
          { text: 'Close - 8.5 to 8.9', value: 'eight_five', odds: '5:2' },
          { text: 'No 9+ scores', value: 'no_nine', odds: '1:2' }
        ],
        timeWindow: 40,
        points: 20
      }
    }
  },

  {
    timeSinceVideoStartedInMs: 900000,
    persistInHistory: false,
    action: {
      channel: "wsl.prop-pickem",
      data: {
        type: 'propResult',
        propId: 'prop_008',
        correctAnswer: 'nine_plus',
        points: 20
      }
    }
  },

  // Final prop pick - Heat winner prediction
  {
    timeSinceVideoStartedInMs: 1000000,
    persistInHistory: false,
    action: {
      channel: "wsl.prop-pickem",
      data: {
        type: 'newProp',
        id: 'prop_009',
        question: 'Who will win this Pipeline heat?',
        context: 'Final minutes - who has what it takes to claim victory?',
        options: [
          { text: 'John John Florence', value: 'jjf_wins', odds: '3:2' },
          { text: 'Gabriel Medina', value: 'medina_wins', odds: '2:1' },
          { text: 'Kelly Slater', value: 'slater_wins', odds: '5:2' }
        ],
        timeWindow: 120,
        points: 25
      }
    }
  },

  {
    timeSinceVideoStartedInMs: 1200000,
    persistInHistory: false,
    action: {
      channel: "wsl.prop-pickem",
      data: {
        type: 'propResult',
        propId: 'prop_009',
        correctAnswer: 'medina_wins',
        points: 25
      }
    }
  }
];
