export const NEW_API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_NEW_API_BASE_URL || 'https://api.newapi.pro',
  apiKey: process.env.NEW_API_KEY,
  defaultModel: 'gpt-4',
  defaultImageModel: 'dall-e-3',
};

export const API_ENDPOINTS = {
  chat: '/v1/chat/completions',
  image: '/v1/images/generations',
  embeddings: '/v1/embeddings',
}; 