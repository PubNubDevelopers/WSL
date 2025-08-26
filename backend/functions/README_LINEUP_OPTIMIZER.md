# WSL Lineup Optimizer Backend

## Overview
The **Lineup Optimizer Function** brings the WSL demo to life by providing AI-powered fantasy lineup optimization with real-time surfer updates and budget validation.

## 🔧 PubNub Console Setup

### Function Configuration
```
Function Name: WSL_Lineup_Optimizer
Event Type: After Publish
Channel Pattern: wsl.lineup.recommendations
Description: AI-powered lineup optimization with budget validation
```

### Required Vault Keys
- None required (uses demo data)
- Optional: External AI service keys for production

## 🚀 What It Does

### 1. **Lineup Optimization**
When users click "🤖 Generate Optimal Lineup":
- Validates budget constraints ($30K-$60K salary cap)
- Processes user risk preference (conservative/balanced/aggressive)
- Generates optimal 6-surfer lineups using AI algorithms
- Returns personalized recommendations with reasoning

### 2. **Real-Time Updates**
During the demo timeline:
- Updates surfer projections based on conditions
- Adjusts expected values and risk scores
- Triggers fresh recommendations automatically
- Shows dynamic form/momentum changes

### 3. **AI Recommendations**
Generates 3 types of lineups:
- **Momentum Play**: Surfers with positive recent form
- **Value Hunter**: Maximum points-per-dollar efficiency  
- **Consensus Play**: Highest projected scoring lineup

## 📊 Demo Timeline Integration

The optimizer integrates with the main demo timeline via `lineup-recommendations.js`:

```
3000ms  → Initial AI recommendations load
5000ms  → Griffin Colapinto conditions boost
8500ms  → Kelly Slater momentum shift
9000ms  → Fresh recommendations after changes
12000ms → John John Florence consistency boost
15000ms → Carissa Moore sleeper alert
17000ms → Final recommendations refresh
```

## 🎯 Message Types Handled

### `optimizeLineup`
```json
{
  "type": "optimizeLineup",
  "preferences": {
    "budget": 50000,
    "riskPreference": "balanced", 
    "selectedSurfers": ["griffin-colapinto"],
    "diversificationTarget": 60
  },
  "userId": "demo-user-001"
}
```

### `surferUpdate` 
```json
{
  "type": "surferUpdate",
  "surferId": "griffin-colapinto",
  "updates": {
    "projectedPoints": 58.2,
    "expectedValue": 4.66,
    "formAdjustment": 12.1
  }
}
```

### `refreshRecommendations`
```json
{
  "type": "refreshRecommendations"
}
```

## 🔄 Response Messages

### Successful Optimization
```json
{
  "type": "lineupOptimized",
  "userId": "demo-user-001",
  "lineup": {
    "id": "balanced_1234567890",
    "name": "Balanced Strategy",
    "riskLevel": "balanced",
    "surfers": [...],
    "totalSalary": 48900,
    "budgetRemaining": 1100,
    "projectedPoints": 267.3,
    "reasoning": ["Optimal balance of safety and upside", ...]
  }
}
```

### AI Recommendations
```json
{
  "type": "lineupRecommendation", 
  "data": {
    "id": "trending_1234567890",
    "name": "Momentum Play",
    "surfers": [...],
    "projectedPoints": 278.5,
    "reasoning": ["Targets surfers with positive recent form", ...]
  }
}
```

## 🎮 Demo Usage

### For Presenters:
1. **Automatic Mode**: Recommendations appear automatically during timeline
2. **Interactive Mode**: Users can request custom optimizations
3. **Real-time Updates**: Surfer stats change based on demo conditions

### Key Demo Points:
- "🤖 AI analyzes 15+ factors per surfer"
- "Real-time optimization in under 500ms" 
- "Budget validation prevents overspend"
- "Risk-adjusted recommendations for different player types"

## 💡 Algorithm Details

### Conservative Strategy
- Prioritizes high floor, low volatility surfers
- Heavy weight on downside protection
- Risk score penalty applied
- 85% diversification target

### Aggressive Strategy  
- Emphasizes tournament upside potential
- Low ownership bonus for contrarian plays
- Stack correlated surfers in good matchups
- 45% diversification (more concentrated)

### Balanced Strategy
- Optimizes expected value + upside range
- Mix of safety and tournament equity
- Salary efficiency considerations
- 65% diversification sweet spot

## 🔍 Technical Implementation

### Budget Validation
```javascript
const lockedSalary = selectedSurfers
  .map(id => surfers.find(s => s.id === id))
  .reduce((sum, s) => sum + s.salary, 0);
  
if (lockedSalary > budget) {
  return { isValid: false, error: 'Selected surfers exceed budget' };
}
```

### Selection Algorithm
```javascript
const score = surfer.expectedValue + 
  (surfer.upside - surfer.downside) * strategyWeight +
  salaryEfficiencyBonus;
```

### Real-time Adjustments
```javascript
projectedPoints: surfer.projectedPoints + 
  surfer.conditionsBonus + 
  surfer.formAdjustment
```

## 🚀 Deployment

1. **Copy Function**: Upload `lineupOptimizerFunction.js` to PubNub Console
2. **Configure Channel**: Set pattern to `wsl.lineup.recommendations`
3. **Test Messages**: Publish test optimization requests
4. **Verify Timeline**: Confirm automatic recommendations trigger

## 📈 Production Considerations

For production deployment:
- Connect to external AI/ML services
- Implement user authentication
- Add rate limiting (10 requests/minute per user)
- Store user preferences in KV store
- Add analytics tracking for optimization requests
- Implement caching for frequently requested lineups

## 🐛 Troubleshooting

### No Recommendations Appearing
- Check channel pattern matches `wsl.lineup.recommendations`
- Verify function is deployed and active
- Test with manual `refreshRecommendations` message

### Budget Validation Errors
- Ensure salary data matches frontend `defaultSurferAnalysis`
- Check for integer overflow in salary calculations
- Verify budget range is 30K-60K

### Performance Issues
- Cache lineup results in KV store
- Optimize selection algorithms for < 500ms response
- Reduce surfer pool size if needed
