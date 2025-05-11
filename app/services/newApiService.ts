import { NEW_API_CONFIG, API_ENDPOINTS } from '../config/api';

export class NewApiService {
  private static instance: NewApiService;
  private baseUrl: string;
  private apiKey: string;

  private constructor() {
    this.baseUrl = NEW_API_CONFIG.baseUrl;
    this.apiKey = NEW_API_CONFIG.apiKey || '';
  }

  public static getInstance(): NewApiService {
    if (!NewApiService.instance) {
      NewApiService.instance = new NewApiService();
    }
    return NewApiService.instance;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async generateImage(prompt: string, options: {
    model?: string;
    size?: string;
    quality?: string;
    style?: string;
  } = {}) {
    const payload = {
      model: options.model || NEW_API_CONFIG.defaultImageModel,
      prompt,
      size: options.size || '1024x1024',
      quality: options.quality || 'standard',
      style: options.style || 'natural',
    };

    return this.request(API_ENDPOINTS.image, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async chat(messages: Array<{ role: string; content: string }>, options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  } = {}) {
    const payload = {
      model: options.model || NEW_API_CONFIG.defaultModel,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 2000,
    };

    return this.request(API_ENDPOINTS.chat, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
} 