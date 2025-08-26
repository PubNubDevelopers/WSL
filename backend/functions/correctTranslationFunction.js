/**
 * WSL Correct Translation Function - Based on Working Implementation
 * 
 * 🔧 PUBNUB CONSOLE CONFIGURATION:
 * ├── Function Name: "WSL_Translation_Correct"
 * ├── Event Type: "Before Publish or Fire"  ⭐ CRITICAL: Not "After Publish"
 * ├── Channel Pattern: "wsl.community.*"
 * ├── Description: "Real-time in-message Portuguese↔English translation"
 * └── Required Vault Keys: DEEPL_AUTH_KEY, SUBSCRIBE_KEY
 * 
 * PURPOSE: Adds translations directly to message metadata - cleaner UX
 */

export default async (request) => {
  const vault = require('vault');
  const xhr = require('xhr');

  const get = (obj, path, defaultValue) => {
    try {
      const result = path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
      return result !== null && result !== undefined ? result : defaultValue;
    } catch (_) {
      return defaultValue;
    }
  };

  try {
    const channel = (request.channels && request.channels[0]) || request.channel || get(request, 'params.channel');
    const message = request.message || {};
    request.meta = request.meta || {};

    // Only process community channels
    if (!channel || !channel.includes('wsl.community')) {
      return request.ok();
    }

    // Extract text payload (handle different message formats)
    let text = '';
    if (typeof message === 'string') text = message;
    else if (typeof message.text === 'string') text = message.text;
    else if (message && message.text && typeof message.text.body === 'string') text = message.text.body;
    else if (typeof message.message === 'string') text = message.message;
    else if (typeof message.content === 'string') text = message.content;

    if (!text || text.length < 3) return request.ok();

    // Skip non-textual messages
    const msgType = (request.meta && request.meta.messageType) || 'text';
    if (msgType !== 'text') return request.ok();

    // Detect source language (Portuguese)
    const portugueseScore = detectPortuguese(text);
    const sourceLang = portugueseScore >= 2 ? 'PT' : undefined;
    
    if (!sourceLang) {
      return request.ok();
    }

    // Objects lookups require subscribe key
    const subscribeKey = await vault.get('SUBSCRIBE_KEY');
    if (!subscribeKey) {
      return await translateToDefault(request, text, sourceLang);
    }

    // Find all members on the channel to determine target languages
    const membersUrl = `https://ps.pndsn.com/v2/objects/sub-key/${encodeURIComponent(subscribeKey)}/channels/${encodeURIComponent(channel)}/uuids`;
    const membersRes = await xhr.fetch(membersUrl, { 
      method: 'GET', 
      headers: { 'Content-Type': 'application/json' } 
    });
    
    const membersJson = await membersRes.json().catch(async () => ({ raw: await membersRes.text().catch(() => '') }));
    if (!membersRes.ok || !membersJson || !Array.isArray(membersJson.data)) {
      return await translateToDefault(request, text, sourceLang);
    }

    // Get language preferences for all members
    const publisher = get(request, 'uuid') || get(request, 'meta.publisher');
    const memberIds = membersJson.data.map((m) => m.uuid && m.uuid.id).filter(Boolean);
    
    // For community channels, default to English if we can't get specific preferences
    const targetLang = 'EN';
    
    // Perform translation
    const translation = await translateWithDeepL(text, sourceLang, targetLang);
    if (translation) {
      request.meta.translatedText = translation;
      request.meta.translatedLang = targetLang;
      request.meta.originalLang = sourceLang;
    }

    return request.ok();

  } catch (error) {
    return request.ok(); // Always allow message through, even on error
  }
};

/**
 * Detect Portuguese text using linguistic patterns
 */
function detectPortuguese(text) {
  const patterns = [
    // Common Portuguese words
    /\b(não|sim|muito|bem|aqui|agora|quando|como|onde|que|este|essa|uma|para|com|por|seu|meu|você|ele|ela|nós|eles|são|está|ter|fazer)\b/gi,
    
    // Portuguese greetings and expressions
    /\b(olá|oi|tchau|obrigado|obrigada|por favor|desculpa|até logo|bom dia|boa tarde|boa noite)\b/gi,
    
    // Surf-specific Portuguese terms
    /\b(surfar|onda|ondas|tubo|manobra|bateria|campeonato|praia|mar|surfista)\b/gi,
    
    // Portuguese endings
    /\w+ção\b/g,  // -ção ending
    /\w+ão\b/g,   // -ão ending
    
    // Portuguese specific patterns
    /\bé\b/g,     // "é" (is/are)
  ];
  
  let score = 0;
  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      score += matches.length;
    }
  });
  
  return score;
}

/**
 * Default translation when user preferences aren't available
 */
async function translateToDefault(request, text, sourceLang) {
  const targetLang = 'EN'; // Default to English
  
  const translation = await translateWithDeepL(text, sourceLang, targetLang);
  if (translation) {
    // FINAL APPROACH: Embed translation data directly in the text field 
    // Since Chat SDK preserves text but filters all custom fields
    if (request.message && typeof request.message === 'object') {
      // Create special marker format that we can parse on frontend
      const translationMarker = `\n[WSL-TRANSLATION:${sourceLang}>${targetLang}:${translation}]`;
      
      // Append translation marker to original text
      request.message.text = text + translationMarker;
    }
    

  }
  
  return request.ok();
}

/**
 * Translate using DeepL API
 */
async function translateWithDeepL(text, sourceLang, targetLang) {
  const vault = require('vault');
  const xhr = require('xhr');
  
  try {
    const deeplKey = await vault.get('DEEPL_AUTH_KEY');
    if (!deeplKey) {
      return `[${targetLang}] ${text}`; // Fallback annotation
    }

    // Enforce safe payload size for DeepL
    const trimmed = String(text).slice(0, 5000);
    const deeplUrl = 'https://api.deepl.com/v2/translate'; // Pro endpoint
    const params = `text=${encodeURIComponent(trimmed)}&target_lang=${encodeURIComponent(targetLang)}${sourceLang ? `&source_lang=${encodeURIComponent(sourceLang)}` : ''}`;

    const res = await xhr.fetch(deeplUrl, {
      method: 'POST',
      headers: { 
        'Authorization': `DeepL-Auth-Key ${deeplKey}`, 
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: params,
    });

    const json = await res.json().catch(async () => ({ raw: await res.text().catch(() => '') }));
    
    if (res.ok && json && json.translations && json.translations[0] && json.translations[0].text) {
      return json.translations[0].text;
    } else {
      return `[${targetLang}] ${trimmed}`; // Fallback
    }

  } catch (error) {
    return `[${targetLang}] ${text}`; // Fallback
  }
}
