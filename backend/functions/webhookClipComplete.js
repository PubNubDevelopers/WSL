/**
 * WSL Clip Processing Webhook Handler
 * 
 * This webhook endpoint receives completion notifications from external video processing service
 * Deploy this as a separate webhook endpoint (not a PubNub Function)
 * 
 * USAGE:
 * - Deploy to serverless platform (Vercel, Netlify, AWS Lambda)
 * - Configure video processing service to POST to this endpoint
 * - Endpoint validates webhook signature and publishes completion events
 */

const PubNub = require('pubnub');
const crypto = require('crypto');

// Initialize PubNub client
const pubnub = new PubNub({
  publishKey: process.env.PUBNUB_PUBLISH_KEY_PROD,
  subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY_PROD,
  secretKey: process.env.PUBNUB_SECRET_KEY_PROD,
  userId: 'webhook-clip-handler'
});

/**
 * Main webhook handler function
 */
async function handleClipCompletion(req, res) {
  try {
    // Validate webhook signature
    const signature = req.headers['x-webhook-signature'];
    const expectedSignature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (signature !== `sha256=${expectedSignature}`) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const clipData = req.body;
    
    // Validate required fields
    if (!clipData.clipId || !clipData.status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    console.log(`Clip processing completed: ${clipData.clipId} - ${clipData.status}`);
    
    if (clipData.status === 'completed' && clipData.downloadUrl) {
      await handleSuccessfulCompletion(clipData);
    } else if (clipData.status === 'failed') {
      await handleProcessingFailure(clipData);
    } else {
      await handleStatusUpdate(clipData);
    }
    
    res.status(200).json({ message: 'Webhook processed successfully' });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Handle successful clip completion
 */
async function handleSuccessfulCompletion(clipData) {
  // Publish completion notification
  await pubnub.publish({
    channel: 'wsl.clips.notifications',
    message: {
      type: 'clip_ready',
      clipId: clipData.clipId,
      status: 'completed',
      downloadUrl: clipData.downloadUrl,
      thumbnailUrl: clipData.thumbnailUrl,
      metadata: {
        duration: clipData.actualDuration,
        fileSize: clipData.fileSize,
        resolution: clipData.resolution,
        quality: clipData.quality,
        processingTime: clipData.processingTime
      },
      timestamp: new Date().toISOString(),
      message: 'Your clip is ready! 🎉'
    }
  });
  
  // Update analytics
  await pubnub.publish({
    channel: 'wsl.analytics.clips',
    message: {
      type: 'clip_completed',
      clipId: clipData.clipId,
      processingTime: clipData.processingTime,
      fileSize: clipData.fileSize,
      quality: clipData.quality,
      timestamp: new Date().toISOString()
    }
  });
  
  console.log(`Clip completion notification sent for: ${clipData.clipId}`);
}

/**
 * Handle processing failure
 */
async function handleProcessingFailure(clipData) {
  await pubnub.publish({
    channel: 'wsl.clips.notifications',
    message: {
      type: 'clip_failed',
      clipId: clipData.clipId,
      status: 'failed',
      error: clipData.error || 'Processing failed',
      timestamp: new Date().toISOString(),
      message: 'Clip generation failed. Please try again. ❌'
    }
  });
  
  // Log failure for monitoring
  await pubnub.publish({
    channel: 'wsl.analytics.errors',
    message: {
      type: 'clip_processing_failure',
      clipId: clipData.clipId,
      error: clipData.error,
      timestamp: new Date().toISOString()
    }
  });
  
  console.log(`Clip failure notification sent for: ${clipData.clipId}`);
}

/**
 * Handle status updates (e.g., "processing", "queued")
 */
async function handleStatusUpdate(clipData) {
  const statusMessages = {
    'queued': 'Clip queued for processing... ⏳',
    'processing': 'Clip is being generated... 🎬',
    'uploading': 'Finalizing your clip... ⬆️'
  };
  
  await pubnub.publish({
    channel: 'wsl.clips.notifications',
    message: {
      type: 'clip_status_update',
      clipId: clipData.clipId,
      status: clipData.status,
      progress: clipData.progress || 0,
      estimatedTimeRemaining: clipData.estimatedTimeRemaining,
      timestamp: new Date().toISOString(),
      message: statusMessages[clipData.status] || 'Clip status updated'
    }
  });
  
  console.log(`Status update sent for clip: ${clipData.clipId} - ${clipData.status}`);
}

// Export for different deployment platforms
module.exports = { handleClipCompletion };

// For Vercel deployment
module.exports.default = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  return handleClipCompletion(req, res);
};

// For Express.js
module.exports.express = (req, res) => {
  return handleClipCompletion(req, res);
};

// For AWS Lambda
module.exports.lambda = async (event, context) => {
  const req = {
    headers: event.headers,
    body: JSON.parse(event.body)
  };
  
  const res = {
    status: (code) => ({ 
      json: (data) => ({ 
        statusCode: code, 
        body: JSON.stringify(data) 
      }) 
    })
  };
  
  return await handleClipCompletion(req, res);
};

