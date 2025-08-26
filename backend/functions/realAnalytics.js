/**
 * WSL Real Analytics Function - Production Version
 * 
 * 🔧 PUBNUB CONSOLE CONFIGURATION:
 * ├── Function Name: "WSL_Real_Analytics"
 * ├── Event Type: "After Publish"
 * ├── Channel Pattern: "wsl.*"
 * ├── Description: "Real-time usage analytics, performance monitoring, and user behavior tracking"
 * └── Required Vault Keys: ANALYTICS_WEBHOOK_URL, ANALYTICS_API_TOKEN (optional for external analytics)
 * 
 * PURPOSE: Real-time usage tracking and performance analytics
 * 
 * PRODUCTION FEATURES:
 * - Real engagement metrics collection
 * - Performance monitoring and alerting
 * - User behavior analytics with KV store
 * - Channel activity tracking
 * - Real-time dashboard data feeds
 * - External analytics service integration (Mixpanel, Google Analytics)
 * 
 * TRIGGERS ON ALL WSL CHANNELS:
 * - wsl.community.* (community chat analytics)
 * - wsl.spots.* (location-specific engagement)
 * - wsl.events.* (event participation tracking)
 * - wsl.clips.* (clip generation metrics)
 * - wsl.fantasy.* (fantasy engagement)
 * - wsl.polls.* (poll participation)
 * - wsl.private.* (watch party analytics)
 * 
 * EXCLUDES: wsl.analytics.*, wsl.admin.* (prevents infinite loops and admin tracking)
 * 
 * PUBLISHES TO:
 * - wsl.dashboard.realtime (real-time metrics for admin dashboard)
 * - wsl.alerts.performance (high activity alerts)
 * 
 * STORES IN KV:
 * - metrics_hourly_{hour} (hourly aggregated metrics)
 * - metrics_minute_{minute} (minute-level real-time data)
 * - user_activity_{userId} (individual user engagement)
 * - channel_activity_{channel} (per-channel statistics)
 */

export default async (request) => {
  const xhr = require('xhr');
  const kvstore = require('kvstore');
  const pubnub = require('pubnub');
  const vault = require('vault');
  
  try {
    const message = request.message;
    const channel = request.channels[0];
    const timetoken = request.timetoken;
    
    // Skip analytics for internal channels
    if (channel.includes('analytics') || channel.includes('admin')) {
      return request.ok();
    }
    
    const timestamp = new Date();
    const currentHour = timestamp.toISOString().slice(0, 13); // YYYY-MM-DDTHH
    const currentMinute = timestamp.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
    
    // Collect message metrics
    const messageMetrics = {
      timestamp: timestamp.toISOString(),
      channel: channel,
      messageType: determineMessageType(message),
      userId: message.userId || 'anonymous',
      messageLength: getMessageLength(message),
      hasMedia: hasMediaContent(message),
      language: message.language || detectLanguage(message),
      channelCategory: getChannelCategory(channel)
    };
    
    // Update real-time counters
    await updateRealtimeMetrics(kvstore, messageMetrics, currentHour, currentMinute);
    
    // Track user engagement
    await trackUserEngagement(kvstore, messageMetrics);
    
    // Track channel activity
    await trackChannelActivity(kvstore, messageMetrics);
    
    // Send to external analytics if configured
    await sendToExternalAnalytics(xhr, vault, messageMetrics);
    
    // Publish real-time metrics for dashboard
    await publishDashboardMetrics(pubnub, messageMetrics);
    
    // Performance monitoring
    await checkPerformanceThresholds(pubnub, messageMetrics);
    
    return request.ok();
    
  } catch (error) {
    console.error('Analytics function error:', error);
    // Don't block message flow on analytics errors
    return request.ok();
  }
};

/**
 * Determine message type from content
 */
function determineMessageType(message) {
  if (!message) return 'unknown';
  
  if (message.type) return message.type;
  
  if (message.text) {
    if (message.text.includes('🤙') || message.text.includes('🏄')) return 'reaction';
    if (message.text.length > 100) return 'long_message';
    return 'chat';
  }
  
  if (message.emoji) return 'emoji_reaction';
  if (message.clipId) return 'clip_related';
  if (message.pollId) return 'poll_related';
  
  return 'other';
}

/**
 * Get message length safely
 */
function getMessageLength(message) {
  if (message.text) return message.text.length;
  if (message.content) return message.content.length;
  return 0;
}

/**
 * Check if message has media content
 */
function hasMediaContent(message) {
  if (message.imageUrl || message.thumbnailUrl) return true;
  if (message.text && (message.text.includes('http') || message.text.includes('www'))) return true;
  return false;
}

/**
 * Simple language detection
 */
function detectLanguage(message) {
  if (!message.text) return 'unknown';
  
  // Portuguese patterns
  if (/\b(não|sim|muito|bem|para|com|você|ele|ela)\b/gi.test(message.text)) {
    return 'pt';
  }
  
  // Spanish patterns
  if (/\b(no|sí|muy|bien|para|con|usted|él|ella)\b/gi.test(message.text)) {
    return 'es';
  }
  
  return 'en'; // Default to English
}

/**
 * Categorize channel type
 */
function getChannelCategory(channel) {
  if (channel.includes('community')) return 'community_chat';
  if (channel.includes('spots')) return 'location_chat';
  if (channel.includes('events')) return 'event_chat';
  if (channel.includes('clips')) return 'clips';
  if (channel.includes('polls')) return 'polls';
  if (channel.includes('cowatch')) return 'watch_party';
  if (channel.includes('private')) return 'private';
  return 'other';
}

/**
 * Update real-time metrics in KV store
 */
async function updateRealtimeMetrics(kvstore, metrics, currentHour, currentMinute) {
  // Hourly metrics
  const hourlyKey = `metrics_hourly_${currentHour}`;
  const hourlyMetrics = await kvstore.get(hourlyKey) || {
    messageCount: 0,
    uniqueUsers: new Set(),
    channels: new Set(),
    messageTypes: {},
    languages: {}
  };
  
  hourlyMetrics.messageCount++;
  hourlyMetrics.uniqueUsers.add(metrics.userId);
  hourlyMetrics.channels.add(metrics.channel);
  hourlyMetrics.messageTypes[metrics.messageType] = (hourlyMetrics.messageTypes[metrics.messageType] || 0) + 1;
  hourlyMetrics.languages[metrics.language] = (hourlyMetrics.languages[metrics.language] || 0) + 1;
  
  // Convert Sets to arrays for storage
  const storableHourlyMetrics = {
    ...hourlyMetrics,
    uniqueUsers: Array.from(hourlyMetrics.uniqueUsers),
    channels: Array.from(hourlyMetrics.channels)
  };
  
  await kvstore.set(hourlyKey, storableHourlyMetrics, 3600); // 1 hour TTL
  
  // Minute-level metrics for real-time dashboard
  const minuteKey = `metrics_minute_${currentMinute}`;
  const minuteMetrics = await kvstore.get(minuteKey) || {
    messageCount: 0,
    activeUsers: new Set()
  };
  
  minuteMetrics.messageCount++;
  minuteMetrics.activeUsers.add(metrics.userId);
  
  const storableMinuteMetrics = {
    ...minuteMetrics,
    activeUsers: Array.from(minuteMetrics.activeUsers)
  };
  
  await kvstore.set(minuteKey, storableMinuteMetrics, 300); // 5 minute TTL
}

/**
 * Track individual user engagement
 */
async function trackUserEngagement(kvstore, metrics) {
  const userKey = `user_activity_${metrics.userId}`;
  const userActivity = await kvstore.get(userKey) || {
    firstSeen: metrics.timestamp,
    lastSeen: metrics.timestamp,
    messageCount: 0,
    channelsVisited: new Set(),
    preferredLanguage: 'en'
  };
  
  userActivity.lastSeen = metrics.timestamp;
  userActivity.messageCount++;
  userActivity.channelsVisited.add(metrics.channel);
  
  // Update preferred language based on usage
  if (metrics.language !== 'unknown') {
    userActivity.preferredLanguage = metrics.language;
  }
  
  const storableUserActivity = {
    ...userActivity,
    channelsVisited: Array.from(userActivity.channelsVisited)
  };
  
  await kvstore.set(userKey, storableUserActivity, 604800); // 7 days TTL
}

/**
 * Track channel-specific activity
 */
async function trackChannelActivity(kvstore, metrics) {
  const channelKey = `channel_activity_${metrics.channel}`;
  const channelActivity = await kvstore.get(channelKey) || {
    messageCount: 0,
    uniqueUsers: new Set(),
    averageMessageLength: 0,
    lastActive: metrics.timestamp
  };
  
  channelActivity.messageCount++;
  channelActivity.uniqueUsers.add(metrics.userId);
  channelActivity.lastActive = metrics.timestamp;
  
  // Update average message length
  const totalLength = (channelActivity.averageMessageLength * (channelActivity.messageCount - 1)) + metrics.messageLength;
  channelActivity.averageMessageLength = totalLength / channelActivity.messageCount;
  
  const storableChannelActivity = {
    ...channelActivity,
    uniqueUsers: Array.from(channelActivity.uniqueUsers)
  };
  
  await kvstore.set(channelKey, storableChannelActivity, 86400); // 24 hours TTL
}

/**
 * Send metrics to external analytics service
 */
async function sendToExternalAnalytics(xhr, vault, metrics) {
  const analyticsEndpoint = vault.get('ANALYTICS_WEBHOOK_URL');
  const analyticsToken = vault.get('ANALYTICS_API_TOKEN');
  
  if (!analyticsEndpoint) return;
  
  try {
    await xhr.fetch(analyticsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${analyticsToken}`,
        'X-Source': 'WSL-PubNub-Analytics'
      },
      body: JSON.stringify({
        event: 'message_published',
        properties: metrics,
        timestamp: metrics.timestamp
      }),
      timeout: 5000 // 5 second timeout
    });
  } catch (error) {
    console.error('External analytics error:', error);
  }
}

/**
 * Publish real-time metrics for dashboard
 */
async function publishDashboardMetrics(pubnub, metrics) {
  await pubnub.publish({
    channel: 'wsl.dashboard.realtime',
    message: {
      type: 'realtime_metric',
      metric: {
        channel: metrics.channel,
        channelCategory: metrics.channelCategory,
        messageType: metrics.messageType,
        language: metrics.language,
        userId: metrics.userId,
        timestamp: metrics.timestamp
      }
    }
  });
}

/**
 * Check performance thresholds and alert if needed
 */
async function checkPerformanceThresholds(pubnub, metrics) {
  const kvstore = require('kvstore');
  
  // Check for unusual activity spikes
  const currentMinute = metrics.timestamp.slice(0, 16);
  const minuteKey = `metrics_minute_${currentMinute}`;
  const minuteMetrics = await kvstore.get(minuteKey);
  
  if (minuteMetrics && minuteMetrics.messageCount > 100) { // Alert if >100 messages per minute
    await pubnub.publish({
      channel: 'wsl.alerts.performance',
      message: {
        type: 'high_activity_alert',
        messageCount: minuteMetrics.messageCount,
        activeUsers: minuteMetrics.activeUsers.length,
        timestamp: metrics.timestamp,
        severity: 'warning'
      }
    });
  }
}

