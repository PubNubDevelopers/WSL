# WSL Mobile App UI Guidelines

## Overview
This document defines the visual design system for transforming the PubNub Live Events Demo into a WSL-branded mobile surfing experience. The WSL app prioritizes mobile and tablet experiences with a clean, ocean-inspired aesthetic.

## 🎨 Color Palette

### Primary Colors
```css
--wsl-primary-blue: #4A90E2;        /* Main brand blue */
--wsl-deep-blue: #2C5282;           /* Header/navigation */
--wsl-ocean-blue: #3182CE;          /* Accent elements */
--wsl-light-blue: #E6F3FF;          /* Background tints */
```

### Secondary Colors
```css
--wsl-white: #FFFFFF;               /* Primary background */
--wsl-gray-50: #F7FAFC;             /* Card backgrounds */
--wsl-gray-100: #EDF2F7;            /* Dividers */
--wsl-gray-500: #A0AEC0;            /* Secondary text */
--wsl-gray-700: #4A5568;            /* Primary text */
--wsl-gray-900: #1A202C;            /* Headers */
```

### Accent Colors
```css
--wsl-success-green: #48BB78;       /* Live indicators */
--wsl-warning-orange: #ED8936;      /* Notifications */
--wsl-rank-gold: #D69E2E;           /* #1 rankings */
--wsl-rank-silver: #A0AEC0;         /* #2 rankings */
--wsl-rank-bronze: #C05621;         /* #3 rankings */
```

## 📱 Screen Breakpoints

### Mobile First Approach
```css
/* Primary Mobile */
@media (max-width: 414px) { /* iPhone Pro Max and below */ }

/* Large Mobile */
@media (min-width: 415px) and (max-width: 768px) { /* iPad Mini */ }

/* Tablet Portrait */
@media (min-width: 769px) and (max-width: 1024px) { /* iPad */ }

/* Tablet Landscape */
@media (min-width: 1025px) and (max-width: 1366px) { /* iPad Pro */ }
```

## 🔤 Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Type Scale
```css
/* Headlines */
.headline-1 { font-size: 28px; font-weight: 700; line-height: 1.2; }
.headline-2 { font-size: 24px; font-weight: 600; line-height: 1.3; }
.headline-3 { font-size: 20px; font-weight: 600; line-height: 1.4; }

/* Body Text */
.body-large { font-size: 18px; font-weight: 400; line-height: 1.5; }
.body-regular { font-size: 16px; font-weight: 400; line-height: 1.5; }
.body-small { font-size: 14px; font-weight: 400; line-height: 1.4; }

/* Captions & Labels */
.caption { font-size: 12px; font-weight: 500; line-height: 1.3; }
.label { font-size: 11px; font-weight: 600; line-height: 1.2; text-transform: uppercase; letter-spacing: 0.5px; }
```

## 🧩 Component Library

### 1. Navigation

#### Bottom Tab Bar
```css
.bottom-nav {
  height: 83px; /* Includes safe area */
  background: white;
  border-top: 1px solid var(--wsl-gray-100);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: 34px; /* Safe area for home indicator */
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.nav-icon {
  width: 24px;
  height: 24px;
  color: var(--wsl-gray-500);
}

.nav-icon.active {
  color: var(--wsl-primary-blue);
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--wsl-gray-500);
}

.nav-label.active {
  color: var(--wsl-primary-blue);
}
```

#### Top Header
```css
.top-header {
  height: 44px;
  background: var(--wsl-deep-blue);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  padding-top: 44px; /* Status bar height */
}

.header-title {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.header-action {
  color: white;
  font-size: 16px;
  font-weight: 500;
}
```

### 2. Cards & Content

#### Event Card
```css
.event-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.event-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.event-content {
  padding: 16px;
}

.event-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--wsl-gray-900);
  margin-bottom: 4px;
}

.event-subtitle {
  font-size: 14px;
  color: var(--wsl-gray-500);
  margin-bottom: 8px;
}

.event-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.live-indicator {
  width: 8px;
  height: 8px;
  background: var(--wsl-success-green);
  border-radius: 50%;
  animation: pulse 2s infinite;
}
```

#### Surfer Profile Card
```css
.surfer-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin-bottom: 16px;
}

.surfer-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 12px;
  border: 3px solid var(--wsl-light-blue);
}

.surfer-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--wsl-gray-900);
  margin-bottom: 4px;
}

.surfer-tour {
  font-size: 14px;
  color: var(--wsl-gray-500);
  margin-bottom: 16px;
}

.follow-button {
  background: var(--wsl-primary-blue);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 24px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

#### Stats Grid
```css
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin: 20px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--wsl-gray-900);
  display: block;
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--wsl-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}
```

### 3. Lists & Rankings

#### Leaderboard Item
```css
.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid var(--wsl-gray-100);
}

.rank-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--wsl-gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--wsl-gray-700);
  margin-right: 12px;
}

.rank-number.gold {
  background: var(--wsl-rank-gold);
  color: white;
}

.rank-number.silver {
  background: var(--wsl-rank-silver);
  color: white;
}

.rank-number.bronze {
  background: var(--wsl-rank-bronze);
  color: white;
}

.player-info {
  flex: 1;
  margin-right: 12px;
}

.player-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--wsl-gray-900);
}

.player-score {
  font-size: 18px;
  font-weight: 700;
  color: var(--wsl-primary-blue);
}
```

### 4. Interactive Elements

#### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--wsl-primary-blue);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  text-transform: none;
  min-height: 44px; /* Touch target */
}

.btn-primary:active {
  background: var(--wsl-deep-blue);
  transform: scale(0.98);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--wsl-primary-blue);
  border: 2px solid var(--wsl-primary-blue);
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 16px;
  font-weight: 600;
  min-height: 44px;
}

/* Pill Button */
.btn-pill {
  background: var(--wsl-primary-blue);
  color: white;
  border: none;
  border-radius: 22px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

#### Action Sheets & Modals
```css
.action-sheet {
  background: white;
  border-radius: 16px 16px 0 0;
  padding: 20px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
}

.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  margin: 20px;
  max-height: 80vh;
  overflow-y: auto;
}
```

## 📐 Layout Patterns

### 1. Mobile Layout (Portrait)
```css
.mobile-container {
  max-width: 414px;
  margin: 0 auto;
  padding: 0 16px;
}

.content-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--wsl-gray-900);
}

.see-all-link {
  font-size: 14px;
  color: var(--wsl-primary-blue);
  font-weight: 500;
}
```

### 2. Tablet Layout (Portrait & Landscape)
```css
.tablet-container {
  max-width: 768px;
  margin: 0 auto;
  padding: 0 24px;
}

.tablet-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (min-width: 1025px) {
  .tablet-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
```

### 3. Safe Areas & Spacing
```css
.safe-top {
  padding-top: env(safe-area-inset-top);
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Spacing Scale */
.spacing-xs { margin: 4px; }
.spacing-sm { margin: 8px; }
.spacing-md { margin: 16px; }
.spacing-lg { margin: 24px; }
.spacing-xl { margin: 32px; }
```

## 🌊 WSL-Specific Components

### 1. Heat Status Indicator
```css
.heat-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--wsl-light-blue);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--wsl-primary-blue);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.heat-status.live {
  background: var(--wsl-success-green);
  color: white;
}

.heat-status.upcoming {
  background: var(--wsl-warning-orange);
  color: white;
}
```

### 2. Wave Score Display
```css
.wave-score {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.score-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--wsl-primary-blue);
}

.score-decimal {
  font-size: 24px;
  font-weight: 600;
  color: var(--wsl-primary-blue);
}

.score-perfect {
  color: var(--wsl-rank-gold);
  position: relative;
}

.score-perfect::after {
  content: "🌟";
  position: absolute;
  top: -8px;
  right: -16px;
  font-size: 16px;
}
```

### 3. Country Flag & Location
```css
.country-flag {
  width: 24px;
  height: 16px;
  border-radius: 2px;
  object-fit: cover;
  margin-right: 8px;
}

.location-badge {
  display: inline-flex;
  align-items: center;
  background: var(--wsl-gray-50);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  color: var(--wsl-gray-700);
  font-weight: 500;
}
```

### 4. Fantasy Team Card
```css
.fantasy-team-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 2px solid var(--wsl-light-blue);
}

.team-score {
  text-align: center;
  margin-bottom: 16px;
}

.team-score-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--wsl-primary-blue);
}

.team-score-label {
  font-size: 12px;
  color: var(--wsl-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.team-surfers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.team-surfer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.surfer-mini-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.surfer-points {
  font-size: 14px;
  font-weight: 600;
  color: var(--wsl-primary-blue);
  margin-left: auto;
}
```

## 🎭 Animations & Interactions

### 1. Micro-Interactions
```css
/* Button Press */
.btn:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

/* Card Hover/Press */
.card:active {
  transform: scale(0.995);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

/* Live Pulse Animation */
@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}

/* Score Update Animation */
@keyframes score-bounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); color: var(--wsl-rank-gold); }
  100% { transform: scale(1); }
}

.score-update {
  animation: score-bounce 0.5s ease;
}
```

### 2. Loading States
```css
.loading-skeleton {
  background: linear-gradient(90deg, 
    var(--wsl-gray-100) 25%, 
    var(--wsl-gray-50) 50%, 
    var(--wsl-gray-100) 75%);
  background-size: 200% 100%;
  animation: loading-shimmer 1.5s infinite;
}

@keyframes loading-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

## 📷 Image Guidelines

### 1. Hero Images
- **Aspect Ratio**: 16:9 for landscape, 4:3 for events
- **Resolution**: Minimum 750x422px for mobile
- **Focus**: Dynamic surf action, dramatic moments
- **Treatment**: Bright, high contrast, saturated blues and whites

### 2. Profile Photos
- **Aspect Ratio**: 1:1 (Square)
- **Resolution**: Minimum 160x160px (80px display @ 2x)
- **Style**: Professional headshots, good lighting
- **Cropping**: Face centered, shoulders visible

### 3. Event Photography
- **Style**: High-energy action shots, crowd shots, venue beauty
- **Color**: Ocean blues, sandy yellows, bright surf gear
- **Composition**: Dynamic angles, close-ups mixed with wide shots

## 🔧 Implementation Notes

### Mobile-First Development
1. **Start with 375px width** (iPhone standard)
2. **Scale up to tablet** with grid layouts
3. **Use CSS Grid and Flexbox** for responsive layouts
4. **Touch targets minimum 44px** for accessibility
5. **Consider thumb reach zones** for navigation placement

### Performance Optimizations
1. **Lazy load images** below the fold
2. **Use WebP format** with JPEG fallbacks
3. **Implement skeleton loading** for content areas
4. **Cache frequently accessed data** (rankings, scores)
5. **Optimize for poor network conditions**

### Accessibility
1. **Minimum 4.5:1 contrast ratio** for text
2. **Focus indicators** for keyboard navigation
3. **Screen reader support** with proper ARIA labels
4. **Voice control compatibility**
5. **Reduced motion support** for animations

This UI system creates an authentic WSL mobile experience while providing the foundation for implementing the real-time engagement features through PubNub integration.
