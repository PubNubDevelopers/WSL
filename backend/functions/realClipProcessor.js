/**
 * WSL Real Clip Processing Function - Production Version
 * 
 * 🔧 PUBNUB CONSOLE CONFIGURATION:
 * ├── Function Name: "WSL_Real_Clip_Processor"
 * ├── Event Type: "After Publish"
 * ├── Channel Pattern: "wsl.clips.requests"
 * ├── Description: "Process clip generation requests with external video processing service"
 * └── Required Vault Keys: VIDEO_PROCESSING_API_KEY, VIDEO_PROCESSING_ENDPOINT, WEBHOOK_BASE_URL, WEBHOOK_SECRET
 * 
 * PURPOSE: Process clip generation requests with external video service
 * 
 * PRODUCTION FEATURES:
 * - Integration with external video processing API (AWS MediaConvert, Mux, Cloudinary, etc.)
 * - Real webhook handling for processing completion
 * - Queue management for concurrent clip requests
 * - Error handling for failed processing scenarios
 * - Real-time status updates throughout pipeline
 * - KV store for tracking processing status
 * 
 * TRIGGERS ON SPECIFIC CHANNEL:
 * - wsl.clips.requests (clip generation requests only)
 * 
 * PUBLISHES TO:
 * - wsl.clips.notifications (status updates and completion)
 * - wsl.user.{userId}.notifications (user-specific notifications)
 * 
 * EXTERNAL WEBHOOK FLOW:
 * 1. Function sends request to video processing service
 * 2. Service processes video asynchronously
 * 3. Service calls webhook when complete
 * 4. Webhook publishes completion to wsl.clips.notifications
 */

export default async (request) => {
  const xhr = require('xhr');
  const pubnub = require('pubnub');
  const vault = require('vault');
  const kvstore = require('kvstore');
  
  try {
    const clipRequest = request.message;
    const channel = request.channels[0];
    
    console.log('Real clip processing function triggered:', clipRequest);
    
    // Validate clip request format
    if (clipRequest.type !== 'clip_request' || !clipRequest.id) {
      console.log('Invalid clip request format');
      return request.ok();
    }
    
    // Check if clip is already being processed
    const processingStatus = await kvstore.get(`clip_${clipRequest.id}`);
    if (processingStatus) {
      console.log(`Clip ${clipRequest.id} already being processed`);
      return request.ok();
    }
    
    // Mark clip as processing
    await kvstore.set(`clip_${clipRequest.id}`, {
      status: 'processing',
      startedAt: Date.now(),
      userId: clipRequest.userId
    }, 1800); // 30 minute TTL
    
    // Get video processing API credentials from vault
    const videoApiKey = vault.get('VIDEO_PROCESSING_API_KEY');
    const videoApiEndpoint = vault.get('VIDEO_PROCESSING_ENDPOINT');
    
    if (!videoApiKey || !videoApiEndpoint) {
      console.error('Video processing credentials not found in vault');
      await sendClipNotification(pubnub, clipRequest, 'failed', 'Service configuration error');
      return request.ok();
    }
    
    // Send immediate acknowledgment to user
    await sendClipNotification(pubnub, clipRequest, 'processing_started', null);
    
    // Prepare video processing request
    const processingRequest = {
      clipId: clipRequest.id,
      streamId: clipRequest.streamId,
      startTime: clipRequest.timestamp - (clipRequest.duration * 500), // Start before timestamp
      endTime: clipRequest.timestamp + (clipRequest.duration * 500),   // End after timestamp
      duration: clipRequest.duration,
      quality: clipRequest.quality || 'HD',
      format: 'mp4',
      watermark: {
        enabled: true,
        text: '© WSL',
        position: 'bottom-right'
      },
      webhook: {
        url: `${vault.get('WEBHOOK_BASE_URL')}/clips/complete`,
        secret: vault.get('WEBHOOK_SECRET')
      },
      metadata: {
        userId: clipRequest.userId,
        event: 'Pipeline Masters',
        surfer: clipRequest.surfer || 'Unknown',
        timestamp: clipRequest.timestamp
      }
    };
    
    console.log('Sending clip request to video processing service...');
    
    // Make request to external video processing service
    const processingResponse = await xhr.fetch(`${videoApiEndpoint}/clips/create`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${videoApiKey}`,
        'Content-Type': 'application/json',
        'X-Client': 'WSL-PubNub-Function'
      },
      body: JSON.stringify(processingRequest),
      timeout: 30000 // 30 second timeout
    });
    
    if (processingResponse.status !== 200 && processingResponse.status !== 202) {
      throw new Error(`Video processing service returned status: ${processingResponse.status}`);
    }
    
    const responseData = JSON.parse(processingResponse.body);
    
    // Update clip status with job ID
    await kvstore.set(`clip_${clipRequest.id}`, {
      status: 'processing',
      startedAt: Date.now(),
      userId: clipRequest.userId,
      jobId: responseData.jobId,
      estimatedCompletion: Date.now() + (responseData.estimatedDuration * 1000)
    }, 1800);
    
    // Send processing confirmation with estimated time
    await sendClipNotification(pubnub, clipRequest, 'processing_confirmed', null, {
      jobId: responseData.jobId,
      estimatedTime: responseData.estimatedDuration,
      queuePosition: responseData.queuePosition
    });
    
    console.log(`Clip processing initiated successfully. Job ID: ${responseData.jobId}`);
    
    // Set up timeout fallback (in case webhook fails)
    await scheduleTimeoutCheck(kvstore, clipRequest.id, 600000); // 10 minute timeout
    
    return request.ok();
    
  } catch (error) {
    console.error('Clip processing error:', error);
    
    // Send failure notification to user
    await sendClipNotification(pubnub, clipRequest, 'failed', error.message);
    
    // Clean up processing status
    await kvstore.delete(`clip_${clipRequest.id}`);
    
    return request.ok();
  }
};

/**
 * Send clip processing notifications to user
 */
async function sendClipNotification(pubnub, clipRequest, status, errorMessage = null, additionalData = {}) {
  const notification = {
    type: 'clip_notification',
    clipId: clipRequest.id,
    userId: clipRequest.userId,
    status: status,
    timestamp: new Date().toISOString(),
    ...additionalData
  };
  
  if (errorMessage) {
    notification.error = errorMessage;
  }
  
  // Define notification messages
  const messages = {
    'processing_started': 'Clip generation started! ⚡',
    'processing_confirmed': `Clip is being processed... 🎬 ETA: ${additionalData.estimatedTime}s`,
    'completed': 'Your clip is ready! 🎉',
    'failed': `Clip generation failed: ${errorMessage} ❌`
  };
  
  notification.message = messages[status] || 'Clip status updated';
  
  await pubnub.publish({
    channel: 'wsl.clips.notifications',
    message: notification
  });
  
  // Also send to user-specific channel
  await pubnub.publish({
    channel: `wsl.user.${clipRequest.userId}.notifications`,
    message: notification
  });
}

/**
 * Schedule timeout check for clip processing
 */
async function scheduleTimeoutCheck(kvstore, clipId, timeoutMs) {
  // Store timeout info for later cleanup
  await kvstore.set(`clip_timeout_${clipId}`, {
    clipId: clipId,
    timeoutAt: Date.now() + timeoutMs
  }, Math.ceil(timeoutMs / 1000));
}

/**
 * Handle clip processing completion (called by webhook)
 * Note: This would typically be a separate webhook endpoint, but shown here for completeness
 */
async function handleClipCompletion(clipData) {
  const pubnub = require('pubnub');
  const kvstore = require('kvstore');
  
  const clipStatus = await kvstore.get(`clip_${clipData.clipId}`);
  if (!clipStatus) {
    console.log('Clip status not found for completion callback');
    return;
  }
  
  // Update final clip status
  await kvstore.set(`clip_${clipData.clipId}`, {
    ...clipStatus,
    status: 'completed',
    completedAt: Date.now(),
    downloadUrl: clipData.downloadUrl,
    thumbnailUrl: clipData.thumbnailUrl,
    fileSize: clipData.fileSize,
    duration: clipData.actualDuration
  }, 86400); // Keep for 24 hours
  
  // Send completion notification
  await pubnub.publish({
    channel: 'wsl.clips.notifications',
    message: {
      type: 'clip_ready',
      clipId: clipData.clipId,
      userId: clipStatus.userId,
      downloadUrl: clipData.downloadUrl,
      thumbnailUrl: clipData.thumbnailUrl,
      metadata: {
        duration: clipData.actualDuration,
        fileSize: clipData.fileSize,
        resolution: clipData.resolution,
        processingTime: Date.now() - clipStatus.startedAt
      },
      timestamp: new Date().toISOString()
    }
  });
}

