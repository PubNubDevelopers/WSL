/**
 * WSL Lineup Optimizer Function - AI-Powered Fantasy Lineup Generation
 * 
 * 🔧 PUBNUB CONSOLE CONFIGURATION:
 * ├── Function Name: "WSL_Lineup_Optimizer"
 * ├── Event Type: "After Publish"
 * ├── Channel Pattern: "wsl.lineup.recommendations"
 * ├── Description: "AI-powered lineup optimization with budget validation and real-time recommendations"
 * └── Required Vault Keys: None (uses hardcoded surfer data for demo)
 * 
 * PURPOSE: Generate optimal fantasy surfing lineups based on user preferences
 * 
 * PRODUCTION FEATURES:
 * - Budget validation and salary cap enforcement
 * - Risk-based lineup optimization algorithms
 * - Real-time surfer condition adjustments
 * - Multiple lineup strategy generation
 * - User preference-based recommendations
 * - KV store for caching optimization results
 * 
 * TRIGGERS ON SPECIFIC CHANNEL:
 * - wsl.lineup.recommendations (lineup optimization requests)
 * 
 * PUBLISHES TO:
 * - wsl.lineup.recommendations (optimization results)
 * - wsl.user.{userId}.notifications (personal notifications)
 * 
 * MESSAGE TYPES HANDLED:
 * - optimizeLineup: Generate optimal lineup based on preferences
 * - surferUpdate: Update individual surfer stats/conditions
 * - refreshRecommendations: Generate new AI recommendations
 */

export default async (request) => {
  const pubnub = require('pubnub');
  const kvstore = require('kvstore');
  
  try {
    const message = request.message;
    const channel = request.channels[0];
    
    console.log(`🤖 Lineup Optimizer processing message type: ${message.type}`);
    
    // Handle different message types
    switch (message.type) {
      case 'optimizeLineup':
        await handleLineupOptimization(pubnub, message);
        break;
      case 'surferUpdate':
        await handleSurferUpdate(pubnub, kvstore, message);
        break;
      case 'refreshRecommendations':
        await generateAIRecommendations(pubnub);
        break;
      default:
        console.log(`Unknown message type: ${message.type}`);
        break;
    }
    
    return request.ok();
    
  } catch (error) {
    console.error('Lineup Optimizer error:', error);
    return request.ok(); // Don't block message flow
  }
};

/**
 * Handle lineup optimization requests from users
 */
async function handleLineupOptimization(pubnub, message) {
  const { preferences, userId } = message;
  const { budget, riskPreference, selectedSurfers, diversificationTarget } = preferences;
  
  console.log(`🔍 Optimizing lineup for user ${userId} with budget $${budget} and ${riskPreference} risk`);
  
  // Get current surfer data
  const surferPool = getCurrentSurferData();
  
  // Validate budget and selected surfers
  const validationResult = validateLineupRequest(surferPool, selectedSurfers, budget);
  if (!validationResult.isValid) {
    await publishOptimizationError(pubnub, userId, validationResult.error);
    return;
  }
  
  // Generate optimal lineup
  const optimizedLineup = generateOptimalLineup(surferPool, preferences);
  
  // Store result in KV for potential re-use
  await kvstore.set(`lineup_${userId}_latest`, {
    lineup: optimizedLineup,
    timestamp: Date.now(),
    preferences
  }, 300); // 5 minute cache
  
  // Publish optimization result
  await pubnub.publish({
    channel: 'wsl.lineup.recommendations',
    message: {
      type: 'lineupOptimized',
      userId: userId,
      lineup: optimizedLineup,
      timestamp: Date.now()
    }
  });
  
  // Send personal notification
  await pubnub.publish({
    channel: `wsl.user.${userId}.notifications`,
    message: {
      type: 'lineupReady',
      title: '🤖 Your Optimal Lineup is Ready!',
      message: `Generated ${riskPreference} lineup with ${optimizedLineup.projectedPoints.toFixed(1)} projected points`,
      lineup: optimizedLineup
    }
  });
  
  console.log(`✅ Optimization complete for user ${userId}`);
}

/**
 * Generate optimal lineup using AI algorithms
 */
function generateOptimalLineup(surferPool, preferences) {
  const { budget, riskPreference, selectedSurfers, diversificationTarget } = preferences;
  
  // Filter available surfers
  let availableSurfers = surferPool.filter(surfer => 
    !selectedSurfers.includes(surfer.id) || selectedSurfers.includes(surfer.id)
  );
  
  // Apply real-time condition adjustments
  availableSurfers = applyConditionAdjustments(availableSurfers);
  
  // Generate lineup based on risk preference
  let lineup;
  switch (riskPreference) {
    case 'conservative':
      lineup = generateConservativeLineup(availableSurfers, budget, selectedSurfers);
      break;
    case 'aggressive':
      lineup = generateAggressiveLineup(availableSurfers, budget, selectedSurfers);
      break;
    default: // balanced
      lineup = generateBalancedLineup(availableSurfers, budget, selectedSurfers);
      break;
  }
  
  return lineup;
}

/**
 * Generate conservative (low-risk) lineup
 */
function generateConservativeLineup(surfers, budget, lockedSurfers) {
  // Prioritize low risk, high floor players
  const sortedSurfers = surfers
    .filter(s => s.riskLevel === 'low' || s.riskLevel === 'medium')
    .sort((a, b) => (b.downside + b.expectedValue) - (a.downside + a.expectedValue));
    
  const lineup = buildLineup(sortedSurfers, budget, lockedSurfers, 'conservative');
  
  return {
    id: `conservative_${Date.now()}`,
    name: 'Conservative Lineup',
    riskLevel: 'conservative',
    surfers: lineup.surfers,
    totalSalary: lineup.totalSalary,
    budgetRemaining: budget - lineup.totalSalary,
    projectedPoints: lineup.projectedPoints,
    upside: lineup.upside,
    floor: lineup.floor,
    ownership: lineup.ownership,
    diversification: 85,
    reasoning: [
      'Prioritizes consistent performers with high floors',
      'Minimizes bust risk with proven surfers',
      'Balanced salary distribution across positions'
    ]
  };
}

/**
 * Generate aggressive (high-risk, high-upside) lineup
 */
function generateAggressiveLineup(surfers, budget, lockedSurfers) {
  // Prioritize high upside, even with higher risk
  const sortedSurfers = surfers
    .sort((a, b) => (b.upside + b.expectedValue * 0.5) - (a.upside + a.expectedValue * 0.5));
    
  const lineup = buildLineup(sortedSurfers, budget, lockedSurfers, 'aggressive');
  
  return {
    id: `aggressive_${Date.now()}`,
    name: 'High-Upside Lineup',
    riskLevel: 'aggressive',
    surfers: lineup.surfers,
    totalSalary: lineup.totalSalary,
    budgetRemaining: budget - lineup.totalSalary,
    projectedPoints: lineup.projectedPoints,
    upside: lineup.upside,
    floor: lineup.floor,
    ownership: lineup.ownership,
    diversification: 45,
    reasoning: [
      'Targets low-owned surfers with tournament potential',
      'Emphasizes upside over consistency',
      'Stack strategy with correlated plays'
    ]
  };
}

/**
 * Generate balanced lineup
 */
function generateBalancedLineup(surfers, budget, lockedSurfers) {
  // Balance expected value, upside, and risk
  const sortedSurfers = surfers
    .sort((a, b) => (b.expectedValue + (b.upside - b.downside) * 0.3) - (a.expectedValue + (a.upside - a.downside) * 0.3));
    
  const lineup = buildLineup(sortedSurfers, budget, lockedSurfers, 'balanced');
  
  return {
    id: `balanced_${Date.now()}`,
    name: 'Balanced Strategy',
    riskLevel: 'balanced',
    surfers: lineup.surfers,
    totalSalary: lineup.totalSalary,
    budgetRemaining: budget - lineup.totalSalary,
    projectedPoints: lineup.projectedPoints,
    upside: lineup.upside,
    floor: lineup.floor,
    ownership: lineup.ownership,
    diversification: 65,
    reasoning: [
      'Optimal balance of safety and upside',
      'Mix of proven performers and value plays',
      'Solid foundation with tournament equity'
    ]
  };
}

/**
 * Core lineup building algorithm
 */
function buildLineup(surfers, budget, lockedSurfers, strategy) {
  const lineup = [];
  let remainingBudget = budget;
  let remainingSlots = 6;
  
  // Add locked surfers first
  const lockedSurferData = surfers.filter(s => lockedSurfers.includes(s.id));
  for (const surfer of lockedSurferData) {
    if (remainingBudget >= surfer.salary && remainingSlots > 0) {
      lineup.push(surfer);
      remainingBudget -= surfer.salary;
      remainingSlots--;
    }
  }
  
  // Fill remaining slots using greedy algorithm with constraints
  const availablePool = surfers.filter(s => !lockedSurfers.includes(s.id));
  
  while (remainingSlots > 0 && availablePool.length > 0) {
    let bestSurfer = null;
    let bestScore = -1;
    
    for (const surfer of availablePool) {
      if (surfer.salary <= remainingBudget) {
        // Calculate selection score based on strategy
        const score = calculateSelectionScore(surfer, strategy, remainingSlots, remainingBudget);
        
        if (score > bestScore) {
          bestScore = score;
          bestSurfer = surfer;
        }
      }
    }
    
    if (bestSurfer) {
      lineup.push(bestSurfer);
      remainingBudget -= bestSurfer.salary;
      remainingSlots--;
      
      // Remove from available pool
      const index = availablePool.indexOf(bestSurfer);
      availablePool.splice(index, 1);
    } else {
      break; // No affordable options
    }
  }
  
  // Calculate lineup metrics
  const totalSalary = lineup.reduce((sum, s) => sum + s.salary, 0);
  const projectedPoints = lineup.reduce((sum, s) => sum + s.projectedPoints, 0);
  const upside = lineup.reduce((sum, s) => sum + s.upside, 0);
  const floor = lineup.reduce((sum, s) => sum + s.downside, 0);
  const ownership = lineup.reduce((sum, s) => sum + s.ownership, 0) / lineup.length;
  
  return {
    surfers: lineup,
    totalSalary,
    projectedPoints,
    upside,
    floor,
    ownership
  };
}

/**
 * Calculate selection score for lineup building
 */
function calculateSelectionScore(surfer, strategy, remainingSlots, remainingBudget) {
  let score = surfer.expectedValue;
  
  switch (strategy) {
    case 'conservative':
      score += surfer.downside * 0.4; // Heavy floor weighting
      score -= surfer.riskScore * 0.02; // Penalty for risk
      break;
    case 'aggressive':
      score += (surfer.upside - surfer.projectedPoints) * 0.6; // Upside premium
      score -= surfer.ownership * 0.05; // Low ownership bonus
      break;
    default: // balanced
      score += (surfer.upside - surfer.downside) * 0.2; // Range bonus
      score += surfer.projectedPoints * 0.3; // Projection weight
      break;
  }
  
  // Salary efficiency bonus
  const salaryEfficiency = remainingSlots > 1 ? 
    Math.max(0, (remainingBudget / remainingSlots - surfer.salary) / 1000) : 0;
  score += salaryEfficiency;
  
  return score;
}

/**
 * Apply real-time condition adjustments to surfer data
 */
function applyConditionAdjustments(surfers) {
  const conditions = getCurrentConditions();
  
  return surfers.map(surfer => ({
    ...surfer,
    projectedPoints: surfer.projectedPoints + surfer.conditionsBonus + surfer.formAdjustment,
    expectedValue: (surfer.projectedPoints + surfer.conditionsBonus + surfer.formAdjustment) / (surfer.salary / 1000),
    upside: surfer.upside + Math.max(0, surfer.conditionsBonus),
    downside: surfer.downside + Math.min(0, surfer.conditionsBonus)
  }));
}

/**
 * Get current surf conditions (simulated)
 */
function getCurrentConditions() {
  return {
    waveHeight: '8-10ft',
    wind: 'Light offshore',
    tide: 'Mid incoming',
    crowd: 'Moderate',
    weatherBonus: 2.3
  };
}

/**
 * Validate lineup optimization request
 */
function validateLineupRequest(surfers, selectedSurfers, budget) {
  if (budget < 30000 || budget > 60000) {
    return { isValid: false, error: 'Budget must be between $30,000 and $60,000' };
  }
  
  // Check if locked surfers fit in budget
  const lockedSalary = selectedSurfers
    .map(id => surfers.find(s => s.id === id))
    .filter(s => s)
    .reduce((sum, s) => sum + s.salary, 0);
    
  if (lockedSalary > budget) {
    return { isValid: false, error: 'Selected surfers exceed budget' };
  }
  
  if (selectedSurfers.length > 6) {
    return { isValid: false, error: 'Cannot select more than 6 surfers' };
  }
  
  return { isValid: true };
}

/**
 * Handle surfer stat updates
 */
async function handleSurferUpdate(pubnub, kvstore, message) {
  const { surferId, updates } = message;
  
  console.log(`📊 Updating surfer ${surferId} with new stats`);
  
  // Store updated stats
  await kvstore.set(`surfer_${surferId}_updates`, updates, 3600);
  
  // Publish real-time update
  await pubnub.publish({
    channel: 'wsl.lineup.recommendations',
    message: {
      type: 'surferUpdate',
      surferId,
      updates,
      timestamp: Date.now()
    }
  });
}

/**
 * Generate AI recommendations for all users
 */
async function generateAIRecommendations(pubnub) {
  console.log('🤖 Generating fresh AI lineup recommendations');
  
  const recommendations = [
    generateTrendingLineup(),
    generateValueLineup(),
    generateChalkLineup()
  ];
  
  for (const rec of recommendations) {
    await pubnub.publish({
      channel: 'wsl.lineup.recommendations',
      message: {
        type: 'lineupRecommendation',
        data: rec,
        timestamp: Date.now()
      }
    });
  }
}

/**
 * Generate trending/momentum-based lineup
 */
function generateTrendingLineup() {
  const surfers = getCurrentSurferData()
    .filter(s => s.formAdjustment > 0)
    .sort((a, b) => b.formAdjustment - a.formAdjustment)
    .slice(0, 6);
    
  const totalSalary = surfers.reduce((sum, s) => sum + s.salary, 0);
  const projectedPoints = surfers.reduce((sum, s) => sum + s.projectedPoints + s.formAdjustment, 0);
  
  return {
    id: `trending_${Date.now()}`,
    name: 'Momentum Play',
    totalSalary,
    budgetRemaining: 50000 - totalSalary,
    projectedPoints,
    riskLevel: 'balanced',
    upside: surfers.reduce((sum, s) => sum + s.upside, 0),
    floor: surfers.reduce((sum, s) => sum + s.downside, 0),
    ownership: surfers.reduce((sum, s) => sum + s.ownership, 0) / 6,
    diversification: 70,
    surfers,
    reasoning: [
      'Targets surfers with positive recent form',
      'Capitalizes on momentum and confidence',
      'Balanced risk with trending upside'
    ]
  };
}

/**
 * Generate value-focused lineup
 */
function generateValueLineup() {
  const surfers = getCurrentSurferData()
    .sort((a, b) => b.expectedValue - a.expectedValue)
    .slice(0, 6);
    
  const totalSalary = surfers.reduce((sum, s) => sum + s.salary, 0);
  const projectedPoints = surfers.reduce((sum, s) => sum + s.projectedPoints, 0);
  
  return {
    id: `value_${Date.now()}`,
    name: 'Value Hunter',
    totalSalary,
    budgetRemaining: 50000 - totalSalary,
    projectedPoints,
    riskLevel: 'conservative',
    upside: surfers.reduce((sum, s) => sum + s.upside, 0),
    floor: surfers.reduce((sum, s) => sum + s.downside, 0),
    ownership: surfers.reduce((sum, s) => sum + s.ownership, 0) / 6,
    diversification: 85,
    surfers,
    reasoning: [
      'Maximizes points per dollar efficiency',
      'Targets underpriced talent',
      'Strong foundation for cash games'
    ]
  };
}

/**
 * Generate chalk (popular) lineup
 */
function generateChalkLineup() {
  const surfers = getCurrentSurferData()
    .sort((a, b) => b.projectedPoints - a.projectedPoints)
    .slice(0, 6);
    
  const totalSalary = surfers.reduce((sum, s) => sum + s.salary, 0);
  const projectedPoints = surfers.reduce((sum, s) => sum + s.projectedPoints, 0);
  
  return {
    id: `chalk_${Date.now()}`,
    name: 'Consensus Play',
    totalSalary,
    budgetRemaining: 50000 - totalSalary,
    projectedPoints,
    riskLevel: 'balanced',
    upside: surfers.reduce((sum, s) => sum + s.upside, 0),
    floor: surfers.reduce((sum, s) => sum + s.downside, 0),
    ownership: surfers.reduce((sum, s) => sum + s.ownership, 0) / 6,
    diversification: 60,
    surfers,
    reasoning: [
      'Highest projected lineup overall',
      'Safe plays with proven upside',
      'Tournament-viable foundation'
    ]
  };
}

/**
 * Publish optimization error to user
 */
async function publishOptimizationError(pubnub, userId, error) {
  // Send to both user notifications and main channel
  const errorMessage = {
    type: 'optimizationError',
    userId: userId,
    title: '❌ Lineup Optimization Failed',
    message: error,
    timestamp: Date.now()
  };
  
  // Send to user notifications
  await pubnub.publish({
    channel: `wsl.user.${userId}.notifications`,
    message: errorMessage
  });
  
  // Also send to main lineup channel so widget can handle it
  await pubnub.publish({
    channel: 'wsl.lineup.recommendations',
    message: errorMessage
  });
}

/**
 * Get current surfer data (matches frontend defaultSurferAnalysis)
 */
function getCurrentSurferData() {
  return [
    {
      id: "griffin-colapinto",
      name: "Griffin Colapinto", 
      avatar: "/avatars/m/01.jpg",
      position: "power-surfer",
      expectedValue: 4.2,
      riskLevel: "medium",
      riskScore: 45,
      salary: 12500,
      projectedPoints: 52.5,
      ownership: 28.5,
      volatility: 18.3,
      upside: 75.2,
      downside: 32.1,
      matchupRating: "favorable",
      conditionsBonus: 5.2,
      formAdjustment: 8.1,
      weatherImpact: "positive",
      tags: ["power-surfer", "trending-up", "conditions-boost"]
    },
    {
      id: "john-john-florence",
      name: "John John Florence",
      avatar: "/avatars/m/02.jpg", 
      position: "safe-choice",
      expectedValue: 3.8,
      riskLevel: "low",
      riskScore: 22,
      salary: 13800,
      projectedPoints: 48.7,
      ownership: 45.2,
      volatility: 12.1,
      upside: 68.3,
      downside: 38.9,
      matchupRating: "favorable",
      conditionsBonus: 3.1,
      formAdjustment: 2.3,
      weatherImpact: "positive",
      tags: ["pipeline-specialist", "safe-floor", "high-owned"]
    },
    {
      id: "kelly-slater",
      name: "Kelly Slater",
      avatar: "/avatars/m/03.jpg",
      position: "value-pick", 
      expectedValue: 5.1,
      riskLevel: "high",
      riskScore: 67,
      salary: 8900,
      projectedPoints: 45.4,
      ownership: 12.8,
      volatility: 24.6,
      upside: 82.1,
      downside: 18.7,
      matchupRating: "neutral",
      conditionsBonus: 2.8,
      formAdjustment: 12.4,
      weatherImpact: "neutral",
      tags: ["tournament-play", "low-owned", "high-upside"]
    },
    {
      id: "gabriel-medina",
      name: "Gabriel Medina",
      avatar: "/avatars/m/04.jpg",
      position: "safe-choice",
      expectedValue: 3.9,
      riskLevel: "medium", 
      riskScore: 38,
      salary: 11200,
      projectedPoints: 43.7,
      ownership: 32.1,
      volatility: 15.8,
      upside: 64.2,
      downside: 28.3,
      matchupRating: "favorable",
      conditionsBonus: 1.9,
      formAdjustment: -1.2,
      weatherImpact: "neutral",
      tags: ["consistent", "matchup-dependent"]
    },
    {
      id: "italo-ferreira", 
      name: "Italo Ferreira",
      avatar: "/avatars/m/05.jpg",
      position: "high-risk",
      expectedValue: 4.7,
      riskLevel: "extreme",
      riskScore: 89,
      salary: 7600,
      projectedPoints: 35.7,
      ownership: 8.3,
      volatility: 31.2,
      upside: 88.9,
      downside: 8.4,
      matchupRating: "difficult",
      conditionsBonus: -2.1,
      formAdjustment: -8.3,
      weatherImpact: "negative",
      tags: ["boom-bust", "gpp-only", "contrarian"]
    },
    {
      id: "carissa-moore",
      name: "Carissa Moore", 
      avatar: "/avatars/f/01.jpg",
      position: "value-pick",
      expectedValue: 4.4,
      riskLevel: "medium",
      riskScore: 41,
      salary: 9800,
      projectedPoints: 43.1,
      ownership: 19.7,
      volatility: 16.9,
      upside: 67.8,
      downside: 24.6,
      matchupRating: "neutral",
      conditionsBonus: 0.8,
      formAdjustment: 4.2,
      weatherImpact: "positive",
      tags: ["sleeper-pick", "form-boost"]
    }
  ];
}
