// Environment configuration
export const config = {
  openRouterApiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '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',
  openRouterBaseUrl: import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
};

// Validate required environment variables
if (!config.openRouterApiKey) {
  console.warn('OpenRouter API key not found. AI features will not work.');
} else {
  console.log('OpenRouter API key loaded successfully');
  console.log('Using API key:', config.openRouterApiKey.substring(0, 10) + '...');
}
