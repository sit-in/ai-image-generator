export class NewApiService {
  private static instance: NewApiService;
  private baseUrl: string;
  private apiKey: string;

  private constructor() {
    // 打印所有环境变量（注意：不要在生产环境中这样做）
    console.log('Environment variables:', {
      NEXT_PUBLIC_NEW_API_BASE_URL: process.env.NEXT_PUBLIC_NEW_API_BASE_URL,
      NEW_API_KEY: process.env.NEW_API_KEY ? '已设置' : '未设置',
      NODE_ENV: process.env.NODE_ENV
    });

    this.baseUrl = process.env.NEXT_PUBLIC_NEW_API_BASE_URL || 'https://api.newapi.pro';
    this.apiKey = process.env.NEW_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('NEW_API_KEY is not set in environment variables');
    }

    // 验证 API 端点
    console.log('Using API endpoint:', this.baseUrl);
  }

  public static getInstance(): NewApiService {
    if (!NewApiService.instance) {
      NewApiService.instance = new NewApiService();
    }
    return NewApiService.instance;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('Making request to:', url);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...options.headers,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Request failed:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('请求超时');
        }
        if (error.message.includes('ENOTFOUND')) {
          throw new Error('无法连接到 API 服务器，请检查网络连接和 API 地址');
        }
      }
      throw error;
    }
  }

  async generateImage(prompt: string, options: {
    model?: string;
    size?: string;
    quality?: string;
    style?: string;
  } = {}) {
    const payload = {
      model: options.model || 'dall-e-3',
      prompt,
      size: options.size || '1024x1024',
      quality: options.quality || 'standard',
      style: options.style || 'natural',
    };

    console.log('Generating image with payload:', payload);

    return this.request('/v1/images/generations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
} 