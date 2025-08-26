# Asset Requirements & Inventory

## Overview
This document outlines all visual, video, and data assets needed to create an authentic WSL demonstration experience.

## 🖼 Visual Assets

### 1. Surfer Profile Images

#### Pro Surfers (Required: 20 athletes)
**Specifications:**
- **Format**: JPG, WebP preferred
- **Size**: 400x400px minimum (square aspect ratio)
- **Quality**: High resolution, professional photography
- **Style**: Clean backgrounds, good lighting, head and shoulders visible

**Priority Athletes:**
```
Men's Championship Tour:
- Griffin Colapinto (USA) - Featured in demo
- John John Florence (HAW) - Featured in demo  
- Gabriel Medina (BRA) - Featured in AMA demo
- Italo Ferreira (BRA) - Power surfer example
- Kanoa Igarashi (JPN) - Global diversity
- Jordy Smith (ZAF) - Veteran presence
- Filipe Toledo (BRA) - High performance
- Ethan Ewing (AUS) - Rising star

Women's Championship Tour:
- Carissa Moore (HAW) - Multiple world champion
- Stephanie Gilmore (AUS) - Surfing legend
- Caroline Marks (USA) - Young talent
- Tatiana Weston-Webb (BRA) - Top competitor
- Brisa Hennessy (CRC) - International representation
- Molly Picklum (AUS) - Current generation

Big Wave/Specialty:
- Kai Lenny (HAW) - Big wave legend
- Lucas Chianca (BRA) - Nazaré specialist
- Maya Gabeira (BRA) - Women's big wave
- Grant Baker (ZAF) - Big wave veteran
```

**File Naming Convention:**
```
/avatars/surfers/
├── griffin-colapinto.jpg
├── john-john-florence.jpg  
├── gabriel-medina.jpg
└── [firstname-lastname].jpg
```

### 2. Event Location Images

#### Surf Breaks (Required: 10 locations)
**Specifications:**
- **Format**: JPG, 16:9 aspect ratio
- **Size**: 1920x1080px minimum
- **Style**: Dramatic surf photography, perfect waves, vibrant colors

**Priority Locations:**
```
Championship Tour Venues:
- Pipeline, Hawaii (featured in demo)
- Jeffreys Bay, South Africa
- Gold Coast, Australia  
- Ericeira, Portugal
- Teahupo'o, Tahiti
- Cloudbreak, Fiji
- Bells Beach, Australia
- Trestles, California
- Hossegor, France
- Nazaré, Portugal (big wave)
```

**File Structure:**
```
/events/locations/
├── pipeline-hawaii.jpg
├── jeffreys-bay-south-africa.jpg
├── teahupoo-tahiti.jpg
└── [location-country].jpg
```

### 3. Action Photography

#### Wave Riding Shots (Required: 50 images)
**Specifications:**
- **Format**: JPG, various aspect ratios
- **Size**: 1920x1080px minimum
- **Style**: High-energy surf action, spray, dramatic moments

**Categories Needed:**
```
High Performance Maneuvers:
- Aerials and airs (10 images)
- Barrel riding (10 images) 
- Critical turns (10 images)
- Wipeouts and dramatic moments (5 images)

Event Atmosphere:
- Crowd celebrations (5 images)
- Beach/venue overview (5 images)
- Podium ceremonies (5 images)
```

### 4. UI Icons & Graphics

#### WSL Brand Elements
**Specifications:**
- **Format**: SVG preferred, PNG backup
- **Style**: Match WSL official brand guidelines
- **Colors**: Ocean blues, white, minimal color palette

**Required Icons:**
```
Navigation Icons:
- News/Home icon
- Live stream icon  
- Fantasy icon
- Rankings/leaderboard icon
- Events calendar icon

Feature Icons:
- Chat/message bubble
- Hype/excitement meter
- Watch party/group icon
- Clip/scissors icon
- Reaction emojis (🔥, 🤙, 💯, 😱, 🌊)

Status Indicators:
- Live dot (animated)
- Offline indicator
- Loading spinner
- Country flags (major surfing nations)
```

### 5. Background & Texture Assets

#### Ocean-Themed Backgrounds
```
Hero Backgrounds:
- Pipeline wave breaking (hero image)
- Ocean horizon with sunset
- Underwater wave view
- Foam and spray textures

UI Backgrounds:
- Subtle wave patterns
- Ocean blue gradients
- Sandy textures (minimal use)
- Clean geometric patterns in brand colors
```

## 🎥 Video Assets

### 1. Featured Wave Clips

#### Highlight Reels (Required: 20 clips)
**Specifications:**
- **Format**: MP4, H.264 codec
- **Resolution**: 1920x1080 minimum (1080p)
- **Duration**: 15-45 seconds each
- **Framerate**: 30fps or 60fps
- **Audio**: Optional (ambient ocean sounds)

**Categories:**
```
Perfect Scores (8.5+ waves):
- Griffin Colapinto 8.17 at Pipeline (featured)
- John John Florence 9.33 barrel
- Perfect 10 wave compilation
- Big wave rides at Nazaré

Dramatic Moments:
- Heavy wipeouts
- Last-minute heat winners  
- Crowd celebration moments
- Underdog victories

Technical Surfing:
- Progressive airs
- Deep barrel rides
- Critical turns in big waves
- Innovative maneuvers
```

### 2. Loop-able Background Video

#### Ambient Ocean Footage
**Specifications:**
- **Duration**: 30-60 seconds (seamless loop)
- **Resolution**: 4K preferred, 1080p minimum
- **Style**: Calming ocean views, gentle wave motion
- **Use**: Background for loading screens, ambient video

### 3. Pre-Generated Demo Clips

#### Clip Creator Feature Assets
```
Auto-Generated Clips (for demo):
- griffin-colapinto-817-blowtail-layback.mp4
- john-john-florence-933-barrel.mp4  
- pipeline-perfect-10-compilation.mp4
- heavy-wipeout-dramatic.mp4

Thumbnails (JPG, 320x180):
- griffin-colapinto-817-thumb.jpg
- john-john-florence-933-thumb.jpg
- perfect-10-thumb.jpg
- wipeout-thumb.jpg
```

## 📊 Data Assets

### 1. Realistic Demo Data

#### Heat Timeline Data
```javascript
// WSL-specific event timeline
{
  "eventName": "Pipeline Masters",
  "location": "Pipeline, Hawaii",
  "heatDuration": 1200000, // 20 minutes
  "surfers": [
    {
      "name": "Griffin Colapinto",
      "country": "USA", 
      "seed": 1,
      "jersey": "white",
      "stats": {
        "ctRank": 3,
        "ctPoints": 27500,
        "heatWins": 12,
        "avgHeatScore": 14.25
      }
    }
  ],
  "waves": [
    {
      "timestamp": 45000,
      "surfer": "Griffin Colapinto",
      "waveScore": 8.17,
      "judges": [8.0, 8.5, 8.0, 8.5, 8.0],
      "maneuvers": ["blowtail", "layback", "cutback"],
      "crowdReaction": 87 // hype level
    }
  ]
}
```

#### Fantasy Scoring Data
```javascript
// Realistic fantasy team configurations
{
  "fantasyTeams": [
    {
      "username": "WaveWizard",
      "totalScore": 124.67,
      "surfers": {
        "men": ["Griffin Colapinto", "John John Florence", "Gabriel Medina"],
        "women": ["Carissa Moore", "Stephanie Gilmore"]
      },
      "powerSurfers": ["Griffin Colapinto", "Carissa Moore"]
    }
  ]
}
```

#### Chat Conversation Scripts
```javascript
// Realistic surf fan conversations
{
  "heatChatScript": [
    {
      "timestamp": 5000,
      "user": "SurfGrom92",
      "message": "Pipeline is going OFF today! 🌊",
      "country": "USA"
    },
    {
      "timestamp": 8000, 
      "user": "BrazilianBarrel",
      "message": "Vamos Griffin! Show them how it's done! 🤙",
      "country": "Brazil",
      "language": "pt"
    },
    {
      "timestamp": 12000,
      "user": "PipelinePro",
      "message": "That set is looking solid, 8-10ft faces",
      "country": "Hawaii"
    }
  ]
}
```

### 2. Surf Condition Data

#### Realistic Swell Information
```javascript
{
  "swellData": [
    {
      "timestamp": 0,
      "height": "6-8ft",
      "period": "14s", 
      "direction": "W-NW",
      "wind": {
        "speed": "8kts",
        "direction": "Offshore"
      },
      "tide": "Mid incoming"
    }
  ]
}
```

## 🎨 Design System Assets

### 1. Color Palette Files

#### CSS Variables File
```css
/* wsl-colors.css */
:root {
  --wsl-primary-blue: #4A90E2;
  --wsl-deep-blue: #2C5282;
  --wsl-ocean-blue: #3182CE;
  --wsl-light-blue: #E6F3FF;
  --wsl-success-green: #48BB78;
  --wsl-warning-orange: #ED8936;
  --wsl-rank-gold: #D69E2E;
}
```

### 2. Typography Assets

#### Font Files (if custom fonts needed)
```
/fonts/
├── WSL-Primary-Regular.woff2
├── WSL-Primary-Bold.woff2
├── WSL-Secondary-Regular.woff2
└── system-fallbacks.css
```

## 📱 Mobile-Specific Assets

### 1. App Icons & Favicons

#### Multiple Sizes Required
```
/icons/
├── favicon.ico (32x32)
├── apple-touch-icon.png (180x180)
├── icon-192.png (192x192) 
├── icon-512.png (512x512)
└── wsl-logo-white.svg
```

### 2. Splash Screens

#### iOS & Android Launch Screens
```
Launch Images:
- iPhone SE: 750x1334
- iPhone 12: 1170x2532  
- iPhone 12 Pro Max: 1284x2778
- iPad: 1536x2048
- iPad Pro: 2048x2732
```

## 🔍 Asset Sourcing Strategy

### 1. Official WSL Sources
- **WSL Website**: worldsurfleague.com press kit
- **WSL Social Media**: Official Instagram, YouTube
- **Surfer Social Media**: Athletes' official accounts
- **WSL Photography Partners**: Licensed action shots

### 2. Stock Photography (Backup)
- **Surfing Stock**: Shutterstock, Getty Images (search "professional surfing")
- **Ocean Stock**: Underwater shots, wave formations
- **Crowd Stock**: Beach/event atmosphere

### 3. AI-Generated Assets (Last Resort)
- **DALL-E/Midjourney**: For placeholder graphics only
- **Stable Diffusion**: UI icons and abstract elements
- **Note**: Never use AI for athlete likenesses

## 📋 Asset Checklist

### Priority 1 (Demo Essentials)
- [ ] Griffin Colapinto profile image
- [ ] John John Florence profile image  
- [ ] Gabriel Medina profile image (AMA demo)
- [ ] Pipeline location hero image
- [ ] 5 high-quality wave action shots
- [ ] WSL logo SVG files
- [ ] Basic UI icons (chat, live, fantasy)

### Priority 2 (Enhanced Experience)
- [ ] 15 additional surfer profiles
- [ ] 8 event location images
- [ ] 20 action photography shots
- [ ] Video clips for clip creator demo
- [ ] Complete icon set
- [ ] Crowd/atmosphere shots

### Priority 3 (Polish & Scale)
- [ ] Mobile app icons and splash screens
- [ ] Additional video backgrounds
- [ ] Texture and pattern assets
- [ ] Country flag icons
- [ ] Comprehensive data files

## 🚨 Legal Considerations

### 1. Image Rights & Licensing
- **Athlete Images**: Ensure proper licensing for commercial demo use
- **Event Photography**: WSL may have exclusive rights to certain images
- **Stock Photography**: Purchase appropriate commercial licenses
- **Social Media**: Obtain permission before using athletes' social content

### 2. Brand Usage
- **WSL Trademarks**: Follow WSL brand guidelines strictly
- **Athlete Names**: Use respectfully and factually
- **Event Names**: Official event names and locations only

### 3. Demo Disclaimers
- **Clear Labeling**: Mark as "Demo/Prototype" clearly
- **Not Official**: Specify this is not an official WSL product
- **PubNub Partnership**: Clarify this demonstrates PubNub capabilities

This asset inventory ensures the WSL demo feels authentic and professional while respecting intellectual property rights and brand guidelines.
