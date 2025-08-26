# WSL PubNub Demo Environment Setup

This document explains how to configure the environment variables needed for the WSL chat system to work properly.

## Required Environment Variables

Create a `.env.local` file in the `web/` directory with the following variables:

### Core PubNub Keys (Required)
```bash
NEXT_PUBLIC_PUBNUB_PUBLISH_KEY=pub-c-your-publish-key-here
NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY=sub-c-your-subscribe-key-here
```

### Optional Configuration
```bash
# Environment Number for multi-environment setups
NEXT_PUBLIC_ENVIRONMENT_NUMBER=1

# Enable guided demo mode
NEXT_PUBLIC_GUIDED_DEMO=false
```

### Production Keys (Optional)
Only needed if using the advanced WSLAuthManager system:
```bash
NEXT_PUBLIC_PUBNUB_PUBLISH_KEY_PROD=pub-c-your-production-publish-key
NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY_PROD=sub-c-your-production-subscribe-key
```

### External Services (Optional)
For advanced features like translation and video processing:
```bash
DEEPL_API_KEY=your-deepl-api-key-for-translations
VIDEO_PROCESSING_API_KEY=your-video-processing-key
VIDEO_PROCESSING_ENDPOINT=https://api.mux.com/video/v1
WEBHOOK_BASE_URL=https://your-webhook-endpoint.com
WEBHOOK_SECRET=your-webhook-secret
ANALYTICS_API_KEY=your-analytics-key
AUTH_SERVICE_KEY=your-auth-service-key
NEXT_PUBLIC_AUTH_ENDPOINT=https://auth.wsl.com/api/v1
```

## Getting Started

1. **Get PubNub Keys**:
   - Go to [PubNub Admin Dashboard](https://admin.pubnub.com/)
   - Create a new app or use an existing one
   - Copy the Publish and Subscribe keys

2. **Configure PubNub Features**:
   Enable these features in your PubNub app:
   - ✅ Presence
   - ✅ Storage & Playbook (Message Persistence)
   - ✅ App Context (Objects)
   - ✅ Functions (for translation features)
   - ✅ Access Manager (for user authentication)

3. **Create Environment File**:
   ```bash
   cd web/
   touch .env.local
   # Add your environment variables to this file
   ```

4. **Test Configuration**:
   - Start the development server: `npm run dev`
   - The login page should load without "No PubNub Key Found" errors
   - Chat should be functional with message history

## Troubleshooting

### "No PubNub Publish Key Found"
- Make sure `NEXT_PUBLIC_PUBNUB_PUBLISH_KEY` is set in `.env.local`
- Restart your development server after adding environment variables

### "No PubNub Subscribe Key Found"
- Make sure `NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY` is set in `.env.local`
- Verify the key format starts with `sub-c-`

### Chat Not Loading Messages
- Check browser console for authentication errors
- Verify Access Manager is enabled in your PubNub app
- Check that Message Persistence is enabled

### Translation Features Not Working
- Set `DEEPL_API_KEY` if you want Portuguese→English translation
- Translation features are optional and will fail gracefully if not configured

## Architecture Notes

The application currently uses the standard authentication system (`getAuthKey.ts`) which:
- Connects to a PubNub demo token server
- Works with the standard PubNub keys
- Provides Access Manager tokens automatically

The production authentication system (`realAuthentication.ts`) is available but not currently used by the main application flow.
