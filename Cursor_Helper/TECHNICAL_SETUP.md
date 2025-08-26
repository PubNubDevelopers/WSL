# Technical Setup & Requirements

## Overview
This document outlines the technical requirements, environment setup, and dependencies needed to develop and run the WSL PubNub demo transformation.

## 🛠 Development Environment

### System Requirements
```bash
# Operating System
macOS 12+ / Windows 10+ / Ubuntu 20.04+

# Node.js & Package Managers
Node.js 18.0+ (LTS recommended)
npm 9.0+ or yarn 1.22+

# Git
Git 2.30+

# Optional but Recommended
Docker 20.10+ (for containerized development)
VS Code with extensions (see below)
```

### Required VS Code Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## 🔑 PubNub Account Setup

### Required PubNub Features
Enable these features on your PubNub keyset:
```
✅ Stream Controller
✅ Presence  
✅ Message Persistence & Storage
✅ App Context (Objects)
✅ Functions (for advanced features)
✅ Mobile Push Notifications
✅ Access Manager (for production)
```

### Environment Variables
Create `.env` files in both `web/` and `backend/` directories:

**Frontend (`web/.env`)**
```bash
# PubNub Configuration
NEXT_PUBLIC_PUBNUB_PUBLISH_KEY=your_publish_key_here
NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY=your_subscribe_key_here

# WSL Demo Configuration  
NEXT_PUBLIC_APP_NAME=WSL_LIVE_EVENTS
NEXT_PUBLIC_GUIDED_DEMO=true

# Optional: Analytics & Monitoring
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

**Backend (`backend/.env`)**
```bash
# PubNub Configuration
PUBNUB_PUBLISH_KEY=your_publish_key_here
PUBNUB_SUBSCRIBE_KEY=your_subscribe_key_here
PUBNUB_SECRET_KEY=your_secret_key_here

# External API Keys (for Plan 1 only)
SURFLINE_API_KEY=your_surfline_key
DEEPL_API_KEY=your_deepl_api_key
MUX_TOKEN_ID=your_mux_token
MUX_TOKEN_SECRET=your_mux_secret

# Database (if needed)
DATABASE_URL=postgresql://user:pass@localhost:5432/wsl_demo
```

## 📦 Dependencies & Installation

### Frontend Setup
```bash
cd web/
npm install

# Additional WSL-specific dependencies
npm install @pubnub/chat@latest
npm install framer-motion
npm install react-player
npm install @heroui/react
```

### Backend Setup
```bash
cd backend/
npm install

# Additional dependencies for enhanced features
npm install express cors helmet
npm install dotenv nconf
npm install pubnub@latest
```

### Development Tools
```bash
# Global tools for development
npm install -g @next/codemod
npm install -g tailwindcss
npm install -g typescript

# Testing tools
npm install --save-dev jest @testing-library/react
npm install --save-dev playwright
```

## 🗂 Project Structure Updates

### New Directories to Create
```
WSL/
├── Cursor_Helper/                    # Planning documentation
├── web/
│   ├── app/
│   │   ├── widget-heat-lounge/       # New: Heat chat rooms
│   │   ├── widget-swell-sync/        # New: Live surf conditions  
│   │   ├── widget-hype-meter/        # New: Excitement tracking
│   │   ├── widget-fantasy-live/      # Adapted from matchstats
│   │   ├── widget-co-watch/          # New: Watch parties
│   │   ├── widget-clip-creator/      # New: Highlight generation
│   │   └── data/
│   │       ├── wsl-constants.ts      # WSL-specific constants
│   │       ├── surf-data.ts          # Surf conditions data
│   │       └── fantasy-scoring.ts    # Fantasy calculation logic
│   ├── public/
│   │   ├── avatars/surfers/          # Professional surfer photos
│   │   ├── events/                   # Event location images
│   │   ├── clips/                    # Pre-generated video clips
│   │   └── icons/wsl/                # WSL-specific iconography
├── backend/
│   ├── wsl-data/                     # WSL event simulation data
│   │   ├── heat-timeline.js          # Heat events and timing
│   │   ├── surf-conditions.js        # Swell, wind, tide data
│   │   ├── fantasy-scoring.js        # Scoring algorithms
│   │   └── surfer-profiles.js        # Athlete information
│   └── lib/
│       ├── swell-simulator.js        # Realistic surf data generation
│       └── fantasy-engine.js         # Fantasy scoring logic
```

## 🌐 External Service Setup

### For Plan 1 (Production-Ready)
```bash
# Surfline API Setup
1. Register at developer.surfline.com
2. Get API key for wave height/period data
3. Add key to backend/.env

# DeepL Translation API (Upgraded from Google Translate)
1. Sign up at https://www.deepl.com/pro-api
2. Choose Free (500K chars/month) or Pro plan
3. Get API key from account settings
4. Add DEEPL_API_KEY to environment variables

# Video Processing (Mux)
1. Sign up at mux.com
2. Create API access token
3. Add token ID and secret to environment
```

### For Plan 2 (Hybrid Functional)
```bash
# No external services required for demo
# All external data is smartly simulated
# Focus on PubNub configuration only
# DeepL can be added later for production translation
```

### For Plan 3 (UI Simulation)
```bash
# No external services required
# No PubNub configuration needed
# Pure frontend development
```

## 🗄 Database Setup (Optional)

### For User Persistence (Plans 1 & 2)
```sql
-- PostgreSQL schema for user data
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  pubnub_uuid VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  favorite_surfers TEXT[],
  fantasy_teams JSONB,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE fantasy_teams (
  id SERIAL PRIMARY KEY, 
  user_id INTEGER REFERENCES users(id),
  event_id VARCHAR(100),
  surfers JSONB,
  power_surfers VARCHAR(255)[],
  total_score DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE heat_participation (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  heat_id VARCHAR(100),
  messages_sent INTEGER DEFAULT 0,
  reactions_count INTEGER DEFAULT 0,
  hype_contributions INTEGER DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW()
);
```

### SQLite Alternative (Development)
```javascript
// For lighter development setup
const Database = require('better-sqlite3');
const db = new Database('wsl_demo.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pubnub_uuid TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    fantasy_data TEXT,
    points INTEGER DEFAULT 0
  )
`);
```

## 🧪 Testing Setup

### Unit Testing
```bash
# Jest configuration for React components
cd web/
npx jest --init

# Example test structure
web/
├── __tests__/
│   ├── components/
│   │   ├── HeatLounge.test.tsx
│   │   ├── HypeMeter.test.tsx
│   │   └── FantasyLive.test.tsx
│   └── utils/
│       ├── scoring.test.ts
│       └── formatting.test.ts
```

### Integration Testing
```bash
# Playwright for end-to-end testing
npx playwright install
npx playwright codegen localhost:3000

# Test real-time features
tests/
├── e2e/
│   ├── heat-lounge.spec.ts          # Chat functionality
│   ├── real-time-updates.spec.ts    # Live data flow
│   └── fantasy-scoring.spec.ts      # Fantasy calculations
```

### PubNub Testing
```javascript
// Mock PubNub for unit tests
jest.mock('pubnub', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    subscribe: jest.fn(),
    publish: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn()
  }))
}));
```

## 🚀 Development Workflow

### Getting Started
```bash
# 1. Clone and setup
git clone <repo-url>
cd WSL

# 2. Install dependencies
cd web && npm install
cd ../backend && npm install

# 3. Environment setup
cp web/.env.example web/.env
cp backend/.env.example backend/.env
# Edit .env files with your PubNub keys

# 4. Start development
# Terminal 1: Backend
cd backend && npm run generator

# Terminal 2: Frontend  
cd web && npm run dev

# 5. Open browser
open http://localhost:3000
```

### Hot Reload Setup
```javascript
// next.config.ts - Enable fast refresh
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      resolveExtensions: ['.tsx', '.ts', '.jsx', '.js']
    }
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300
      }
    }
    return config
  }
}
```

## 📱 Mobile Development

### iOS Testing (Safari)
```bash
# Enable Safari Developer Mode
1. iOS Settings → Safari → Advanced → Web Inspector
2. Connect iPhone to Mac via USB  
3. Safari → Develop → [Your iPhone] → localhost:3000
```

### Android Testing (Chrome)
```bash
# Enable USB Debugging
1. Android Settings → Developer Options → USB Debugging
2. Connect Android to Mac via USB
3. Chrome → chrome://inspect → localhost:3000
```

### Responsive Testing
```javascript
// Tailwind responsive debugging
<div className="bg-red-500 sm:bg-blue-500 md:bg-green-500 lg:bg-yellow-500">
  Current breakpoint indicator
</div>
```

## 🔍 Debugging Tools

### PubNub Debug Console
```javascript
// Enable PubNub logging
const pubnub = new PubNub({
  publishKey: 'your-key',
  subscribeKey: 'your-key', 
  logVerbosity: true,        // Enable debug logs
  ssl: true
});
```

### React Developer Tools
```bash
# Browser extensions for debugging
- React Developer Tools
- Redux DevTools (if using Redux)
- PubNub Console (browser-based message inspector)
```

### Network Monitoring
```javascript
// Monitor PubNub message flow
pubnub.addListener({
  status: (statusEvent) => {
    console.log('PubNub Status:', statusEvent);
  },
  message: (messageEvent) => {
    console.log('Message Received:', messageEvent);
  },
  presence: (presenceEvent) => {
    console.log('Presence Event:', presenceEvent);
  }
});
```

## 🔧 Performance Optimization

### Bundle Analysis
```bash
# Analyze Next.js bundle size
cd web/
npm run build
npm run analyze
```

### PubNub Optimization
```javascript
// Efficient channel subscriptions
const subscribeToHeat = (heatId) => {
  pubnub.subscribe({
    channels: [
      `wsl.heat.${heatId}.chat`,
      `wsl.heat.${heatId}.hype`,
      `wsl.heat.${heatId}.props`
    ],
    withPresence: true
  });
};
```

### Caching Strategy
```javascript
// Cache frequently accessed data
const cache = new Map();
const getCachedSurferData = (surferId) => {
  if (cache.has(surferId)) {
    return cache.get(surferId);
  }
  const data = fetchSurferData(surferId);
  cache.set(surferId, data);
  return data;
};
```

## 🆕 Week 3 Production Additions

### DeepL Translation API (Premium Quality)
```bash
# DeepL provides higher quality translations than Google Translate
# Especially effective for Portuguese→English translation

# Environment Setup
DEEPL_API_KEY=your-deepl-api-key:fx

# PubNub Functions Configuration
# Store in PubNub Functions Vault:
DEEPL_API_KEY=your-deepl-api-key:fx

# API Endpoints
# Free Plan: https://api-free.deepl.com/v2/translate
# Pro Plan: https://api.deepl.com/v2/translate

# Benefits over Google Translate:
# - Better translation quality (especially Portuguese)
# - Faster response times (<200ms vs <300ms)
# - Free tier: 500,000 characters/month
# - Better handling of surf terminology and slang
```

### Production PubNub Functions
```bash
# 4 Real Functions for Production Deployment:
1. realTranslationFunction.js    # DeepL API integration
2. realModerationFunction.js     # Content filtering 
3. realClipProcessor.js          # Video processing
4. realAnalytics.js             # Usage tracking

# Each function includes detailed configuration comments
# for PubNub Console deployment
```

### External Service Health Monitoring
```javascript
// Service health check system
const healthCheck = async () => {
  const services = {
    deeplTranslate: await checkDeepLHealth(),
    videoProcessing: await checkVideoServiceHealth(),
    analytics: await checkAnalyticsHealth()
  };
  return services;
};
```

This technical setup ensures a smooth development experience for any of the WSL transformation plans while providing production-ready configuration for DeepL integration and external service monitoring.
