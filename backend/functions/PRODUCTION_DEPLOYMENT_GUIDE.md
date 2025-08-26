# 🚀 WSL PubNub Functions - Production Deployment Guide

## Overview

This guide walks you through deploying the real WSL PubNub Functions to production infrastructure, replacing all demo/simulation code with authentic serverless functionality.

## 📋 Prerequisites

### Required Accounts & Services
1. **PubNub Production Account** with Functions 2.0 enabled
2. **Google Cloud Platform** with Translate API enabled
3. **Video Processing Service** (AWS MediaConvert, Cloudinary, or similar)
4. **Analytics Platform** (optional - Google Analytics, Mixpanel)
5. **Webhook Hosting** (Vercel, Netlify, AWS Lambda)

### Environment Variables Needed
```bash
# PubNub Production Keys
PUBNUB_PUBLISH_KEY_PROD=pk-c-xxxxxxxxxxxx
PUBNUB_SUBSCRIBE_KEY_PROD=sub-c-xxxxxxxxxxxx
PUBNUB_SECRET_KEY_PROD=sec-c-xxxxxxxxxxxx

# Google Translate API
GOOGLE_TRANSLATE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxx

# Video Processing Service
VIDEO_PROCESSING_API_KEY=your-video-api-key
VIDEO_PROCESSING_ENDPOINT=https://api.videoservice.com/v1

# Webhooks
WEBHOOK_BASE_URL=https://your-webhook-domain.com
WEBHOOK_SECRET=your-secure-random-string

# Analytics (optional)
ANALYTICS_WEBHOOK_URL=https://analytics-endpoint.com
ANALYTICS_API_TOKEN=your-analytics-token
```

---

## 🔧 Step 1: PubNub Console Setup

### 1.1 Create Production Keyset
1. Log into [PubNub Admin Portal](https://admin.pubnub.com)
2. Create new App: "WSL Production"
3. Create new Keyset: "Production"
4. Enable these features:
   - ✅ Presence
   - ✅ Message Persistence
   - ✅ Functions 2.0
   - ✅ Access Manager
   - ✅ Signals

### 1.2 Configure Access Manager
```javascript
// Grant permissions for production channels
pubnub.grant({
  channels: [
    'wsl.community.*',
    'wsl.spots.*', 
    'wsl.events.*',
    'wsl.clips.*',
    'wsl.translations.*'
  ],
  read: true,
  write: true,
  manage: false,
  ttl: 0 // Permanent
});
```

### 1.3 Set Up Vault Secrets
Navigate to Functions → Vault and add:
- `GOOGLE_TRANSLATE_API_KEY`
- `VIDEO_PROCESSING_API_KEY`
- `VIDEO_PROCESSING_ENDPOINT`
- `WEBHOOK_BASE_URL`
- `WEBHOOK_SECRET`
- `ANALYTICS_WEBHOOK_URL` (optional)
- `ANALYTICS_API_TOKEN` (optional)

---

## 📦 Step 2: Deploy PubNub Functions

### 2.1 Translation Function
1. Go to Functions → Create New Function
2. **Name**: `RealTranslationFunction`
3. **Event Type**: `After Publish`
4. **Channel Pattern**: `wsl.community.*,wsl.spots.*`
5. **Code**: Copy from `realTranslationFunction.js`
6. **Test** with Portuguese message
7. **Deploy** to production

### 2.2 Moderation Function
1. **Name**: `RealModerationFunction`
2. **Event Type**: `Before Publish` 
3. **Channel Pattern**: `wsl.*`
4. **Code**: Copy from `realModerationFunction.js`
5. **Test** with test messages
6. **Deploy** to production

### 2.3 Clip Processing Function
1. **Name**: `RealClipProcessor`
2. **Event Type**: `After Publish`
3. **Channel Pattern**: `wsl.clips.requests`
4. **Code**: Copy from `realClipProcessor.js`
5. **Test** with clip request
6. **Deploy** to production

### 2.4 Analytics Function
1. **Name**: `RealAnalytics`
2. **Event Type**: `After Publish`
3. **Channel Pattern**: `wsl.*` (exclude: `wsl.analytics.*,wsl.admin.*`)
4. **Code**: Copy from `realAnalytics.js`
5. **Test** with various messages
6. **Deploy** to production

---

## 🌐 Step 3: Deploy Webhook Handlers

### 3.1 Vercel Deployment
```bash
# Create vercel project
mkdir wsl-webhooks
cd wsl-webhooks
npm init -y
npm install pubnub crypto

# Create api/clips/complete.js
# Copy code from webhookClipComplete.js

# Deploy
vercel --prod
```

### 3.2 Environment Variables
```bash
vercel env add PUBNUB_PUBLISH_KEY_PROD
vercel env add PUBNUB_SUBSCRIBE_KEY_PROD  
vercel env add PUBNUB_SECRET_KEY_PROD
vercel env add WEBHOOK_SECRET
```

### 3.3 Configure Video Service Webhook
Update your video processing service to POST to:
```
https://your-app.vercel.app/api/clips/complete
```

---

## 🎯 Step 4: Frontend Integration

### 4.1 Update Production Keys
```typescript
// web/app/getAuthKey.ts
const PRODUCTION_CONFIG = {
  publishKey: process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY_PROD,
  subscribeKey: process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY_PROD,
  userId: user.id // Real user ID from authentication
};
```

### 4.2 Real Channel Configuration
```typescript
// web/app/data/constants.ts
export const PRODUCTION_CHANNELS = {
  heatLounge: 'wsl.community.global',
  translations: 'wsl.translations.global',
  clipRequests: 'wsl.clips.requests',
  clipNotifications: 'wsl.clips.notifications',
  moderationAlerts: 'wsl.moderation.alerts',
  analytics: 'wsl.analytics.realtime'
};
```

### 4.3 Remove Demo Code
1. Delete all `backend/game-data/` simulators ✅ DONE
2. Update widgets to use real PubNub subscriptions
3. Remove mock data and fake counters
4. Implement real presence tracking

---

## 📊 Step 5: Monitoring & Analytics

### 5.1 PubNub Debug Console
1. Enable Debug Console in PubNub Admin
2. Monitor function execution logs
3. Set up alerts for function failures
4. Track message throughput and latency

### 5.2 Function Performance Monitoring
```javascript
// Add to each function for monitoring
console.time('function-execution');
// ... function logic ...
console.timeEnd('function-execution');
```

### 5.3 Real-time Dashboard
Create dashboard to monitor:
- Active users by channel
- Message volume per minute/hour
- Translation requests and success rate
- Clip processing queue and completion rate
- Moderation events and user management

---

## 🧪 Step 6: Production Testing

### 6.1 End-to-End Test Scenarios
1. **Real Translation Flow**:
   - Send Portuguese message → Check English translation appears
   - Verify <300ms latency
   - Test caching functionality

2. **Content Moderation**:
   - Send banned word → Verify message blocked
   - Test rate limiting → Verify auto-mute
   - Check moderation alerts

3. **Clip Generation**:
   - Request clip → Verify processing starts
   - Check webhook completion → Verify notification
   - Test error scenarios

4. **Analytics Tracking**:
   - Send various messages → Check metrics collection
   - Verify real-time dashboard updates
   - Test performance alerts

### 6.2 Load Testing
```bash
# Use Artillery.js for load testing
npm install -g artillery
artillery quick --count 50 --num 100 wss://ps.pndsn.com/subscribe/...
```

### 6.3 Failover Testing
- Test function timeout scenarios
- Verify graceful degradation
- Check error handling and recovery

---

## 🚨 Step 7: Go-Live Checklist

### Pre-Launch
- [ ] All functions deployed and tested
- [ ] Webhook endpoints responding correctly
- [ ] Production keys configured
- [ ] Monitoring dashboards operational
- [ ] Error alerting configured
- [ ] Performance baselines established

### Launch Day
- [ ] Switch frontend to production keys
- [ ] Monitor function execution logs
- [ ] Watch real-time metrics
- [ ] Verify user authentication working
- [ ] Check translation accuracy
- [ ] Test clip generation pipeline

### Post-Launch
- [ ] Monitor user feedback
- [ ] Track performance metrics
- [ ] Optimize based on usage patterns
- [ ] Scale infrastructure as needed

---

## 📈 Success Metrics

### Technical Performance
- **Message Latency**: <100ms average
- **Translation Speed**: <300ms Portuguese→English
- **Function Uptime**: >99.9%
- **Clip Processing**: <60s average completion

### User Engagement
- **Real-time Users**: Track concurrent active users
- **Message Volume**: Monitor daily/hourly message counts
- **Translation Usage**: Track Portuguese message frequency
- **Clip Sharing**: Monitor clip generation and sharing rates

---

## 🔧 Troubleshooting

### Common Issues
1. **Functions Not Triggering**
   - Check channel patterns match exactly
   - Verify function is deployed and enabled
   - Check PubNub debug console logs

2. **Translation Failures**
   - Verify Google Translate API key in vault
   - Check API quota and billing
   - Monitor error logs for specific failures

3. **Webhook Timeouts**
   - Verify webhook URL accessibility
   - Check signature validation
   - Monitor webhook response times

4. **High Latency**
   - Monitor function execution times
   - Check external API response times
   - Optimize KV store usage

---

## 🎊 Production Ready!

After completing this deployment guide, your WSL platform will have:

✅ **Real PubNub Functions** running on production infrastructure  
✅ **Authentic Translation** via Google Translate API  
✅ **Live Moderation** with user management  
✅ **Real Clip Processing** with external video services  
✅ **Production Analytics** with real-time monitoring  

**Your WSL platform is now production-ready for real surfers worldwide! 🏄‍♂️🌊**

