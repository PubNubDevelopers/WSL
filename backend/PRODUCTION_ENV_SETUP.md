# 🌊 WSL Platform - Production Environment Setup Guide

## Overview

This guide covers all environment variables and external service configurations needed for production deployment.

## 🔑 Required Environment Variables

### PubNub Production Configuration
```bash
# Production PubNub Keys (get from admin.pubnub.com)
NEXT_PUBLIC_PUBNUB_PUBLISH_KEY_PROD=pk-c-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY_PROD=sub-c-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PUBNUB_SECRET_KEY_PROD=sec-c-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Authentication endpoint
NEXT_PUBLIC_AUTH_ENDPOINT=https://your-auth-service.com/api/v1
```

### DeepL Translation API
```bash
# Get from: https://www.deepl.com/pro-api
DEEPL_API_KEY=your-deepl-api-key-here:fx
# Note: DeepL provides higher quality translations than Google Translate
```

### Video Processing Service
```bash
# Video Processing API (Mux, AWS MediaConvert, Cloudinary, etc.)
VIDEO_PROCESSING_API_KEY=your-video-api-key
VIDEO_PROCESSING_SECRET=your-video-api-secret
VIDEO_PROCESSING_ENDPOINT=https://api.mux.com/video/v1
VIDEO_PROCESSING_WEBHOOK_SECRET=your-webhook-signing-secret
```

### Webhook Configuration
```bash
# Webhook Base URL (where your webhook handlers are deployed)
WEBHOOK_BASE_URL=https://wsl-webhooks.vercel.app
WEBHOOK_SECRET=your-super-secure-random-string-here
```

### Authentication Providers
```bash
# Google OAuth (for user authentication)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Apple ID OAuth
APPLE_CLIENT_ID=your.apple.service.id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
```

### Analytics & Monitoring
```bash
# Analytics Platform
ANALYTICS_API_KEY=your-analytics-api-key
ANALYTICS_ENDPOINT=https://api.mixpanel.com
ANALYTICS_PROJECT_TOKEN=your-mixpanel-project-token

# Error Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## 🔧 PubNub Functions Vault Setup

Store these keys in PubNub Functions Vault:

1. Login to admin.pubnub.com
2. Go to Functions → Vault
3. Add these keys:

```
DEEPL_API_KEY=your-deepl-api-key:fx
VIDEO_PROCESSING_API_KEY=your-video-api-key
VIDEO_PROCESSING_ENDPOINT=https://api.mux.com/video/v1
WEBHOOK_BASE_URL=https://wsl-webhooks.vercel.app
WEBHOOK_SECRET=your-super-secure-random-string-here
ANALYTICS_WEBHOOK_URL=https://api.mixpanel.com/track
ANALYTICS_API_TOKEN=your-mixpanel-project-token
```

## 🌐 External Service Setup Instructions

### 1. DeepL Translation API Setup
```bash
# Sign up for DeepL API (higher quality than Google Translate)
1. Go to https://www.deepl.com/pro-api
2. Create DeepL account and choose plan (Free or Pro)
3. Get your API key from account settings
4. Add key to environment variables
5. Note: Free plan has 500,000 characters/month limit
```

### 2. Video Processing Service Setup

#### Option A: Mux (Recommended)
```bash
# Sign up at mux.com
1. Create account at https://mux.com
2. Get API Access Token and Secret
3. Configure webhook endpoint for processing completion
4. Add credentials to environment
```

#### Option B: AWS MediaConvert
```bash
# AWS MediaConvert setup
1. Configure AWS credentials
2. Create MediaConvert job template
3. Set up S3 bucket for input/output
4. Configure CloudWatch Events for job completion
```

### 3. Webhook Deployment

#### Vercel Deployment
```bash
# Deploy webhook handlers to Vercel
mkdir wsl-webhooks
cd wsl-webhooks
npm init -y
npm install pubnub

# Create api/clips/complete.js with webhook handler code
vercel --prod
```

#### Environment Variables for Webhooks
```bash
vercel env add PUBNUB_PUBLISH_KEY_PROD
vercel env add PUBNUB_SUBSCRIBE_KEY_PROD
vercel env add PUBNUB_SECRET_KEY_PROD
vercel env add WEBHOOK_SECRET
```

### 4. Authentication Setup

#### Google OAuth Setup
```bash
# Google OAuth Console
1. Go to https://console.developers.google.com/
2. Create OAuth 2.0 credentials
3. Configure authorized redirect URIs
4. Get client ID and secret
```

#### Facebook OAuth Setup
```bash
# Facebook Developer Console
1. Go to https://developers.facebook.com/
2. Create new app
3. Add Facebook Login product
4. Configure Valid OAuth Redirect URIs
```

## 🔒 Security Checklist

### Production Security Requirements
- [ ] All API keys stored securely (not in code)
- [ ] PubNub Access Manager enabled and configured
- [ ] Webhook signatures validated
- [ ] Rate limiting implemented
- [ ] HTTPS enforced for all endpoints
- [ ] User authentication required for sensitive operations
- [ ] Content moderation functions active
- [ ] Error monitoring and alerting configured

### PubNub Security Configuration
```javascript
// Access Manager permissions
pubnub.grant({
  channels: ['wsl.*'],
  authKeys: ['user-auth-token'],
  read: true,
  write: true,
  manage: false,
  ttl: 3600 // 1 hour
});
```

## 📊 Monitoring & Alerts Setup

### Required Monitoring
- [ ] PubNub Function execution monitoring
- [ ] External API response time tracking
- [ ] Error rate alerting
- [ ] User authentication success/failure tracking
- [ ] Real-time message delivery monitoring

### Analytics Events to Track
- User registration and login
- Message sending and receiving
- Translation requests and success rate
- Clip generation requests and completion
- Watch party creation and participation
- Feature usage analytics

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] External services tested and healthy
- [ ] PubNub Functions deployed and tested
- [ ] Webhook endpoints deployed and responding
- [ ] Authentication flow tested end-to-end
- [ ] Content moderation rules configured

### Deployment Steps
1. **Deploy Webhooks**: Deploy webhook handlers first
2. **Configure PubNub**: Set up production keyset and functions
3. **Deploy Frontend**: Deploy with production environment variables
4. **Test Integration**: Verify all external services working
5. **Monitor Launch**: Watch real-time metrics and error logs

### Post-Deployment
- [ ] Monitor error rates and performance
- [ ] Verify real user authentication working
- [ ] Test translation functionality with real users
- [ ] Validate clip generation pipeline
- [ ] Check analytics data collection
- [ ] Monitor resource usage and scaling needs

## 🔧 Troubleshooting

### Common Issues

**Translation not working**
- Verify Google Translate API key in PubNub Vault
- Check API quota and billing status
- Monitor function execution logs

**Clip processing failures**
- Verify video service API credentials
- Check webhook endpoint accessibility
- Monitor processing queue status

**Authentication errors**
- Verify OAuth provider configuration
- Check redirect URI configuration
- Monitor token generation and validation

**High latency**
- Monitor external API response times
- Check PubNub Function execution times
- Verify network connectivity and CDN configuration

This completes the production environment setup guide for the WSL platform!

