/**
 * WSL External Services Configuration - Production
 * 
 * Centralized configuration for all external API integrations
 * Used by PubNub Functions and frontend components
 */

export interface ExternalServiceConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  healthCheck?: string;
}

export interface WSLExternalServices {
  deeplTranslate: ExternalServiceConfig;
  videoProcessing: ExternalServiceConfig;
  analytics: ExternalServiceConfig;
  authentication: ExternalServiceConfig;
  webhooks: {
    baseUrl: string;
    secret: string;
    endpoints: {
      clipComplete: string;
      userAuth: string;
      analytics: string;
    };
  };
}

/**
 * Production external services configuration
 */
export const PRODUCTION_SERVICES: WSLExternalServices = {
  deeplTranslate: {
    name: 'DeepL Translation API',
    baseUrl: 'https://api-free.deepl.com/v2', // Use 'https://api.deepl.com/v2' for Pro
    apiKey: process.env.DEEPL_API_KEY || '',
    timeout: 3000,
    retryAttempts: 2,
    healthCheck: '/languages'
  },
  
  videoProcessing: {
    name: 'Video Processing Service',
    baseUrl: process.env.VIDEO_PROCESSING_ENDPOINT || 'https://api.mux.com/video/v1',
    apiKey: process.env.VIDEO_PROCESSING_API_KEY || '',
    timeout: 30000,
    retryAttempts: 1,
    healthCheck: '/health'
  },
  
  analytics: {
    name: 'Analytics Platform',
    baseUrl: process.env.ANALYTICS_ENDPOINT || 'https://api.mixpanel.com',
    apiKey: process.env.ANALYTICS_API_KEY || '',
    timeout: 10000,
    retryAttempts: 3
  },
  
  authentication: {
    name: 'WSL Auth Service',
    baseUrl: process.env.NEXT_PUBLIC_AUTH_ENDPOINT || 'https://auth.wsl.com/api/v1',
    apiKey: process.env.AUTH_SERVICE_KEY || '',
    timeout: 15000,
    retryAttempts: 2,
    healthCheck: '/health'
  },
  
  webhooks: {
    baseUrl: process.env.WEBHOOK_BASE_URL || 'https://wsl-webhooks.vercel.app',
    secret: process.env.WEBHOOK_SECRET || '',
    endpoints: {
      clipComplete: '/api/clips/complete',
      userAuth: '/api/auth/callback',
      analytics: '/api/analytics/event'
    }
  }
};

/**
 * Environment variables validation
 */
export function validateExternalServices(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required environment variables
  const required = [
    'DEEPL_API_KEY',
    'VIDEO_PROCESSING_API_KEY',
    'VIDEO_PROCESSING_ENDPOINT',
    'WEBHOOK_BASE_URL',
    'WEBHOOK_SECRET'
  ];
  
  required.forEach(envVar => {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  });
  
  // Validate URLs
  const urls = [
    process.env.VIDEO_PROCESSING_ENDPOINT,
    process.env.WEBHOOK_BASE_URL,
    process.env.NEXT_PUBLIC_AUTH_ENDPOINT
  ].filter(Boolean);
  
  urls.forEach(url => {
    try {
      new URL(url!);
    } catch {
      errors.push(`Invalid URL: ${url}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Service health checker
 */
export async function checkServiceHealth(service: ExternalServiceConfig): Promise<boolean> {
  if (!service.healthCheck) return true;
  
  try {
    const url = service.healthCheck.startsWith('http') 
      ? service.healthCheck 
      : `${service.baseUrl}${service.healthCheck}`;
      
    const response = await fetch(url, {
      method: 'GET',
      timeout: service.timeout,
      headers: {
        'Authorization': `Bearer ${service.apiKey}`,
        'User-Agent': 'WSL-Health-Check'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error(`Health check failed for ${service.name}:`, error);
    return false;
  }
}

/**
 * Initialize and validate all external services
 */
export async function initializeExternalServices(): Promise<{ 
  success: boolean; 
  results: Record<string, boolean>;
  errors: string[];
}> {
  console.log('🔧 Initializing external services...');
  
  // First validate environment
  const envValidation = validateExternalServices();
  if (!envValidation.valid) {
    return {
      success: false,
      results: {},
      errors: envValidation.errors
    };
  }
  
  // Check service health
  const healthChecks = await Promise.allSettled([
    checkServiceHealth(PRODUCTION_SERVICES.deeplTranslate),
    checkServiceHealth(PRODUCTION_SERVICES.videoProcessing),
    checkServiceHealth(PRODUCTION_SERVICES.analytics),
    checkServiceHealth(PRODUCTION_SERVICES.authentication)
  ]);
  
  const results = {
    deeplTranslate: healthChecks[0].status === 'fulfilled' && healthChecks[0].value,
    videoProcessing: healthChecks[1].status === 'fulfilled' && healthChecks[1].value,
    analytics: healthChecks[2].status === 'fulfilled' && healthChecks[2].value,
    authentication: healthChecks[3].status === 'fulfilled' && healthChecks[3].value
  };
  
  const allHealthy = Object.values(results).every(Boolean);
  const errors: string[] = [];
  
  if (!allHealthy) {
    Object.entries(results).forEach(([service, healthy]) => {
      if (!healthy) {
        errors.push(`Service unhealthy: ${service}`);
      }
    });
  }
  
  console.log('🔧 External services status:', results);
  
  return {
    success: allHealthy,
    results,
    errors
  };
}

/**
 * Get service configuration by name
 */
export function getServiceConfig(serviceName: keyof WSLExternalServices): ExternalServiceConfig | null {
  const service = PRODUCTION_SERVICES[serviceName];
  return typeof service === 'object' && 'baseUrl' in service ? service : null;
}

/**
 * Build webhook URL for a specific endpoint
 */
export function getWebhookUrl(endpoint: keyof typeof PRODUCTION_SERVICES.webhooks.endpoints): string {
  return `${PRODUCTION_SERVICES.webhooks.baseUrl}${PRODUCTION_SERVICES.webhooks.endpoints[endpoint]}`;
}

/**
 * Create authenticated headers for external service calls
 */
export function createServiceHeaders(service: ExternalServiceConfig, additionalHeaders: Record<string, string> = {}): Record<string, string> {
  return {
    'Authorization': `Bearer ${service.apiKey}`,
    'Content-Type': 'application/json',
    'User-Agent': 'WSL-Production-Client',
    'X-Service': service.name,
    ...additionalHeaders
  };
}

