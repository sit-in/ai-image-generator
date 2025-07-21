// 环境变量验证
import { z } from 'zod';

// 定义环境变量 schema
const envSchema = z.object({
  // 必需的环境变量
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  REPLICATE_API_TOKEN: z.string().min(1, 'REPLICATE_API_TOKEN is required'),
  
  // 可选但推荐的环境变量
  REPLICATE_MODEL: z.string().default('black-forest-labs/flux-schnell'),
  CSRF_SECRET: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Redis 配置（生产环境推荐）
  REDIS_URL: z.string().url().optional(),
  
  // CDN 配置（可选）
  IMAGE_CDN_URL: z.string().url().optional(),
  
  // 文件上传限制（可选）
  MAX_FILE_SIZE: z.string().regex(/^\d+$/, 'MAX_FILE_SIZE must be a number').optional(),
  
  // MCP 配置（可选）
  SUPABASE_PROJECT_REF: z.string().optional(),
  SUPABASE_ACCESS_TOKEN: z.string().optional(),
  
  // API 配置（可选）
  NEW_API_KEY: z.string().optional(),
  NEW_API_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_NEW_API_BASE_URL: z.string().url().optional(),
});

// 验证结果类型
type EnvValidationResult = {
  success: boolean;
  data?: z.infer<typeof envSchema>;
  errors?: Array<{
    variable: string;
    message: string;
  }>;
  warnings?: string[];
};

// 验证环境变量
export function validateEnv(): EnvValidationResult {
  try {
    const env = envSchema.parse(process.env);
    
    // 收集警告
    const warnings: string[] = [];
    
    // 生产环境警告
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.CSRF_SECRET) {
        warnings.push('CSRF_SECRET is not set. This is highly insecure in production!');
      }
      
      if (!process.env.REDIS_URL) {
        warnings.push('REDIS_URL is not set. Using in-memory rate limiting which is not suitable for multi-instance deployments.');
      }
      
      if (!process.env.IMAGE_CDN_URL) {
        warnings.push('IMAGE_CDN_URL is not set. Consider using a CDN for better performance.');
      }
    }
    
    // 安全警告
    if (process.env.SUPABASE_SERVICE_ROLE_KEY?.includes('eyJ')) {
      warnings.push('SUPABASE_SERVICE_ROLE_KEY appears to be exposed. Ensure it is kept secret.');
    }
    
    return {
      success: true,
      data: env,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        variable: err.path.join('.'),
        message: err.message
      }));
      
      return {
        success: false,
        errors
      };
    }
    
    return {
      success: false,
      errors: [{
        variable: 'unknown',
        message: 'An unexpected error occurred during environment validation'
      }]
    };
  }
}

// 获取环境变量（带类型安全）
export function getEnv() {
  const result = validateEnv();
  if (!result.success) {
    throw new Error('Environment validation failed');
  }
  return result.data!;
}

// 检查必需的环境变量（启动时调用）
export function checkRequiredEnv() {
  const result = validateEnv();
  
  if (!result.success) {
    console.error('\n❌ Environment validation failed:\n');
    result.errors?.forEach(error => {
      console.error(`  - ${error.variable}: ${error.message}`);
    });
    console.error('\nPlease check your .env.local file and ensure all required variables are set.\n');
    
    if (process.env.NODE_ENV === 'production') {
      // 生产环境直接退出
      process.exit(1);
    }
  } else {
    console.log('✅ Environment variables validated successfully');
    
    if (result.warnings && result.warnings.length > 0) {
      console.warn('\n⚠️  Warnings:');
      result.warnings.forEach(warning => {
        console.warn(`  - ${warning}`);
      });
      console.warn('');
    }
  }
}

// 导出环境变量类型
export type Env = z.infer<typeof envSchema>;