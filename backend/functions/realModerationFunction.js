/**
 * WSL Real Moderation Function - Production Version
 * 
 * 🔧 PUBNUB CONSOLE CONFIGURATION:
 * ├── Function Name: "WSL_Real_Moderation"
 * ├── Event Type: "Before Publish" ⚠️ IMPORTANT: Must be BEFORE to block messages
 * ├── Channel Pattern: "wsl.*"
 * ├── Description: "Real-time content moderation, spam detection, and user management"
 * └── Required Vault Keys: None (uses KV store only)
 * 
 * PURPOSE: Real-time content moderation and user management
 * 
 * PRODUCTION FEATURES:
 * - Content filtering with banned words and spam detection
 * - User ban/mute management via KV store
 * - Rate limiting (10 messages/minute per user)
 * - Real-time moderation alerts for admin dashboard
 * - Escalation system for flagged content
 * 
 * TRIGGERS ON ALL WSL CHANNELS:
 * - wsl.community.* (all community channels)
 * - wsl.spots.* (location-specific channels)
 * - wsl.events.* (event channels)
 * - wsl.clips.* (clip-related channels)
 * - wsl.private.* (private party channels)
 * 
 * EXCLUDES: wsl.admin.*, wsl.system.* (admin channels bypass moderation)
 */

export default async (request) => {
  const pubnub = require('pubnub');
  const kvstore = require('kvstore');
  const vault = require('vault');
  
  try {
    const message = request.message;
    const userId = message.userId;
    const channel = request.channels[0];
    
    console.log(`Moderation check for user ${userId} on channel ${channel}`);
    
    // Skip moderation for admin channels
    if (channel.includes('admin') || channel.includes('system')) {
      return request.ok();
    }
    
    // Check if user is banned
    const banStatus = await kvstore.get(`ban_${userId}`);
    if (banStatus && banStatus.isBanned) {
      console.log(`Blocked message from banned user: ${userId}`);
      await logModerationEvent('message_blocked_banned_user', userId, channel, message.text);
      return request.abort(); // Block message entirely
    }
    
    // Check if user is muted
    const muteStatus = await kvstore.get(`mute_${userId}`);
    if (muteStatus && muteStatus.isMuted && muteStatus.mutedUntil > Date.now()) {
      console.log(`Blocked message from muted user: ${userId}`);
      await logModerationEvent('message_blocked_muted_user', userId, channel, message.text);
      return request.abort();
    }
    
    // Rate limiting check
    const rateLimitKey = `rate_${userId}_${Math.floor(Date.now() / 60000)}`; // Per minute
    const currentCount = await kvstore.get(rateLimitKey) || 0;
    
    if (currentCount >= 10) { // Max 10 messages per minute
      console.log(`Rate limit exceeded for user: ${userId}`);
      await autoMuteUser(kvstore, userId, 300000); // 5 minute mute
      await logModerationEvent('rate_limit_exceeded', userId, channel, message.text);
      return request.abort();
    }
    
    await kvstore.set(rateLimitKey, currentCount + 1, 60); // 1 minute TTL
    
    // Content filtering
    if (message.text && typeof message.text === 'string') {
      const contentCheck = await checkMessageContent(message.text, userId, channel);
      
      if (contentCheck.action === 'block') {
        console.log(`Message blocked due to content: ${contentCheck.reason}`);
        await logModerationEvent('content_blocked', userId, channel, message.text, contentCheck.reason);
        return request.abort();
      }
      
      if (contentCheck.action === 'flag') {
        console.log(`Message flagged for review: ${contentCheck.reason}`);
        await flagForModeration(pubnub, userId, channel, message, contentCheck.reason);
        
        // Replace message content with warning
        request.message.text = '[Message flagged for moderation - under review]';
        request.message.moderated = true;
        request.message.originalLength = message.text.length;
      }
      
      if (contentCheck.action === 'warn') {
        // Add warning metadata but allow message
        request.message.warning = contentCheck.reason;
      }
    }
    
    return request.ok();
    
  } catch (error) {
    console.error('Moderation error:', error);
    // On error, allow message (fail open)
    return request.ok();
  }
};

/**
 * Check message content for violations
 */
async function checkMessageContent(text, userId, channel) {
  const lowerText = text.toLowerCase();
  
  // Severe violations - immediate block
  const bannedWords = [
    'spam', 'scam', 'hack', 'cheat', 'bot', 'fake',
    // Add more based on community guidelines
  ];
  
  for (const word of bannedWords) {
    if (lowerText.includes(word)) {
      return { action: 'block', reason: `banned_word_${word}` };
    }
  }
  
  // Spam detection patterns
  const spamPatterns = [
    /(.)\1{4,}/, // Repeated characters (aaaaa)
    /^[A-Z\s!]{10,}$/, // All caps
    /https?:\/\/[^\s]+/i, // URLs (flag for review)
    /\b\d{4,}\b/ // Long numbers (phone/spam)
  ];
  
  for (let i = 0; i < spamPatterns.length; i++) {
    if (spamPatterns[i].test(text)) {
      const reasons = ['repeated_chars', 'all_caps', 'suspicious_link', 'suspicious_number'];
      return { action: 'flag', reason: reasons[i] };
    }
  }
  
  // Length checks
  if (text.length > 300) {
    return { action: 'flag', reason: 'message_too_long' };
  }
  
  if (text.length < 2) {
    return { action: 'warn', reason: 'message_too_short' };
  }
  
  return { action: 'allow' };
}

/**
 * Auto-mute user for specified duration
 */
async function autoMuteUser(kvstore, userId, durationMs) {
  const muteData = {
    isMuted: true,
    mutedAt: Date.now(),
    mutedUntil: Date.now() + durationMs,
    reason: 'auto_mute_rate_limit',
    duration: durationMs
  };
  
  await kvstore.set(`mute_${userId}`, muteData, Math.ceil(durationMs / 1000));
}

/**
 * Flag message for admin review
 */
async function flagForModeration(pubnub, userId, channel, message, reason) {
  await pubnub.publish({
    channel: 'wsl.moderation.alerts',
    message: {
      type: 'content_flagged',
      userId: userId,
      channel: channel,
      originalMessage: {
        text: message.text,
        timetoken: message.timetoken || Date.now() * 10000
      },
      flagReason: reason,
      severity: getSeverity(reason),
      timestamp: new Date().toISOString(),
      requiresReview: true
    }
  });
}

/**
 * Log moderation events for analytics
 */
async function logModerationEvent(eventType, userId, channel, messageText, reason = null) {
  const pubnub = require('pubnub');
  
  await pubnub.publish({
    channel: 'wsl.analytics.moderation',
    message: {
      type: 'moderation_event',
      event: eventType,
      userId: userId,
      channel: channel,
      messageLength: messageText ? messageText.length : 0,
      reason: reason,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Get severity level for different violation types
 */
function getSeverity(reason) {
  const highSeverity = ['banned_word', 'suspicious_link'];
  const mediumSeverity = ['all_caps', 'message_too_long', 'repeated_chars'];
  
  if (highSeverity.some(pattern => reason.includes(pattern))) return 'high';
  if (mediumSeverity.some(pattern => reason.includes(pattern))) return 'medium';
  return 'low';
}

