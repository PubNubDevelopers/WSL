/**
 * WSL Heat Lounge Translation Function
 * 
 * Triggers: After Publish on channel pattern "wsl.heat.*.lounge"
 * Purpose: Detects Portuguese messages and translates to English
 * 
 * This Function triggers AFTER a message is published to any WSL Heat Lounge channel.
 * If the message contains Portuguese text, it translates to English and publishes
 * the translation to a dedicated translation channel for real-time display.
 */

export default async (event) => {
  const xhr = require('xhr');
  const pubnub = require('pubnub');
  const crypto = require('crypto');

  try {
    // Get the original message and channel
    const originalMessage = event.message;
    const sourceChannel = event.channels[0];
    
    // Only process text messages from the Heat Lounge
    if (!originalMessage || typeof originalMessage !== 'object') {
      return event.ok();
    }

    // Extract text content from message
    let messageText = '';
    
    // Handle different message formats
    if (typeof originalMessage.text === 'string') {
      messageText = originalMessage.text;
    } else if (typeof originalMessage.content === 'string') {
      messageText = originalMessage.content;
    } else if (typeof originalMessage.message === 'string') {
      messageText = originalMessage.message;
    } else if (typeof originalMessage === 'string') {
      messageText = originalMessage;
    }

    if (!messageText || messageText.length < 3) {
      return event.ok();
    }

    // Detect Portuguese text using common Portuguese words and patterns
    const portuguesePatterns = [
      /\b(não|sim|muito|bem|aqui|agora|quando|como|onde|que|este|essa|uma|para|com|por|seu|meu|você|ele|ela|nós|eles)\b/gi,
      /\b(obrigado|obrigada|por favor|desculpa|desculpe|oi|olá|tchau|até logo|bom dia|boa tarde|boa noite)\b/gi,
      /\b(surfar|onda|tubo|manobra|bateria|campeonato|praia|mar|pipeline)\b/gi, // Surf-specific Portuguese terms
      /ção\b/g, // Portuguese -ção ending
      /ão\b/g,  // Portuguese -ão ending
      /\bé\b/g  // Portuguese "é" (is/are)
    ];

    let portugueseScore = 0;
    for (const pattern of portuguesePatterns) {
      const matches = messageText.match(pattern);
      if (matches) {
        portugueseScore += matches.length;
      }
    }

    // If Portuguese score is low, skip translation
    if (portugueseScore < 2) {
      return event.ok();
    }

    // Use Google Translate API (free tier via public endpoint)
    // In production, you'd use vault.get() to store API keys securely
    const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=en&dt=t&q=${encodeURIComponent(messageText)}`;
    
    try {
      const translateResponse = await xhr.fetch(translateUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PubNub Function)'
        }
      });

      if (translateResponse.status !== 200) {
        throw new Error(`Translation API returned status: ${translateResponse.status}`);
      }

      // Parse Google Translate response format
      const translateData = JSON.parse(translateResponse.body);
      
      if (!translateData || !translateData[0] || !translateData[0][0]) {
        throw new Error('Invalid translation response format');
      }

      const translatedText = translateData[0][0][0];
      
      if (!translatedText || translatedText === messageText) {
        return event.ok();
      }

      // Create translation channel name based on source channel
      const translationChannel = sourceChannel.replace('.lounge', '.translations');

      // Publish the translation with original message context
      await pubnub.publish({
        channel: translationChannel,
        message: {
          type: 'translation',
          originalMessage: {
            text: messageText,
            userId: originalMessage.userId || 'unknown',
            timetoken: originalMessage.timetoken || Date.now() * 10000,
            language: 'pt'
          },
          translation: {
            text: translatedText,
            language: 'en',
            confidence: portugueseScore,
            translatedAt: new Date().toISOString()
          },
          sourceChannel: sourceChannel,
          translationId: await crypto.sha256(messageText + Date.now())
        }
      });

    } catch (translateError) {
      // Don't abort - let the original message proceed
    }

    return event.ok();
    
  } catch (error) {
    // Always allow the original message to proceed
    return event.ok();
  }
};
