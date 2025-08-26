# Gold Jersey Drama Demo

This script creates a compelling competition finale demonstration for the Winner Profile Widget (Gold Jersey system).

## 🎬 What It Does

Simulates the dramatic final 5 minutes of the "Pipeline Masters - Week 7" competition:

1. **📋 Current Standings** - Shows initial leaderboard
2. **⚡ Dramatic Rank Changes** - Participants surge up and down rankings  
3. **🚀 Epic Comeback** - SurfOracleMaui charges from 5th to 1st place!
4. **🎯 Achievement Unlocks** - Awards rare/epic achievements for clutch performance
5. **🏆 Gold Jersey Ceremony** - Awards gold jerseys to top performers
6. **🎉 Community Celebration** - Announces competition completion

## 🚀 Usage

### Full Drama Demo (26 seconds total)
```bash
cd backend/game-data
node gold-jersey-drama.js drama
```

### Quick Gold Jersey Award
```bash
node gold-jersey-drama.js quick
```

## 📊 Demo Timeline

```
Phase 1: Current Standings (3s)
├─ Shows initial leaderboard positions
├─ PipelineQueen leads with 3,120 points

Phase 2: Dramatic Rank Changes (8s)  
├─ SurferHawk2024 jumps to #2 (3,087 pts)
├─ AlohaAce surges to #2 (3,156 pts)  
├─ Final surge: SurfOracleMaui to #1 (3,289 pts!) 

Phase 3: Achievement Unlocks (5s)
├─ "Comeback King" (Epic) → SurfOracleMaui
├─ "Clutch Performer" (Epic) → PipelineQueen

Phase 4: Gold Jersey Awards (7s)
├─ Weekly Champion → SurfOracleMaui  
├─ "Prediction Perfectionist" (Legendary) → PipelineQueen
├─ Prediction Master Jersey → PipelineQueen

Phase 5: Community Celebration (3s)
├─ Competition complete announcement
├─ Final statistics and celebration
```

## 🎯 Expected Widget Behavior

The Winner Profile Widget should show:

1. **Real-time leaderboard updates** in "👑 This Week" tab
2. **Achievement notification banners** appearing at top
3. **Gold jersey awards** being added to winner profiles  
4. **User profile updates** showing new achievements and jerseys
5. **Community celebration** messages

## 📱 Demo Script Integration

Perfect for the 10-minute WSL demo at:
- **Scene 5: Monetization & Scale** - Show community recognition
- **Technical Demo** - Demonstrate real-time profile updates
- **Investor Pitch** - Highlight engagement and gamification

## 🔧 Technical Details

- **Channels Used**: 
  - `wsl.profiles.winners` (leaderboard updates, gold jerseys)
  - `wsl.profiles.achievements` (achievement unlocks)
- **Message Types**: 
  - `leaderboardUpdate`, `goldJerseyAwarded`, `achievementUnlocked`
- **Total Duration**: ~26 seconds with natural pacing
- **Total Messages**: ~12 PubNub messages with realistic delays

This creates a compelling demonstration of competitive community features and real-time recognition systems!
