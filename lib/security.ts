import DOMPurify from 'isomorphic-dompurify'
import { z } from 'zod'
import { sensitiveWordsFilter } from './sensitive-words'
import { CSRFProtection } from './csrf'
import { NextResponse } from 'next/server'

// 输入验证模式
export const schemas = {
  // 图片生成验证
  imageGeneration: z.object({
    prompt: z.string()
      .min(1, '提示词不能为空')
      .max(1000, '提示词不能超过1000字符')
      .refine(
        (val) => !containsMaliciousContent(val),
        '提示词包含不当内容'
      ),
    style: z.enum(['natural', 'anime', 'oil', 'watercolor', 'pixel', 'ghibli']),
    size: z.enum(['1024x1024', '1024x1792', '1792x1024']).optional(),
    quality: z.enum(['standard', 'hd']).optional()
  }),

  // 用户注册验证
  userRegistration: z.object({
    email: z.string()
      .email('请输入有效的邮箱地址')
      .max(255, '邮箱地址过长'),
    password: z.string()
      .min(8, '密码至少8位')
      .max(128, '密码不能超过128位')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字'),
    name: z.string()
      .min(1, '姓名不能为空')
      .max(50, '姓名不能超过50字符')
      .refine(
        (val) => !containsMaliciousContent(val),
        '姓名包含不当内容'
      )
  }),

  // 兑换码验证
  redeemCode: z.object({
    code: z.string()
      .regex(/^[A-Z0-9]{8,16}$/, '兑换码格式不正确')
  }),

  // 管理员代码生成验证
  adminCodeGeneration: z.object({
    tier: z.enum(['BASIC', 'STANDARD', 'PREMIUM']),
    count: z.number()
      .min(1, '数量至少为1')
      .max(1000, '单次生成数量不能超过1000'),
    prefix: z.string()
      .max(4, '前缀不能超过4字符')
      .optional()
  })
}

// 检查恶意内容
function containsMaliciousContent(input: string): boolean {
  const maliciousPatterns = [
    // SQL注入模式
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    // XSS模式
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/i,
    /on\w+\s*=/i,
    // 危险HTML标签
    /<(object|embed|applet|form|input|button)/i,
    // 敏感关键词（根据需要调整）
    /(\b(admin|root|password|token|key|secret)\b)/i,
    // 特殊字符组合
    /[<>'"&;]/g
  ]

  return maliciousPatterns.some(pattern => pattern.test(input))
}

// 内容过滤和清理
export function sanitizeInput(input: string): string {
  // 移除HTML标签
  const cleaned = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
  
  // 移除多余空格
  return cleaned.trim().replace(/\s+/g, ' ')
}

// 敏感词检测（使用增强版过滤器）
export function containsSensitiveWords(text: string): boolean {
  const result = sensitiveWordsFilter.check(text);
  
  if (result.isSensitive) {
    console.log('Sensitive words detected:', result.matchedWords);
    if (result.suggestions) {
      console.log('Suggestions:', result.suggestions);
    }
  }
  
  return result.isSensitive;
}

// 获取敏感词检测详情
export function getSensitiveWordsDetails(text: string) {
  return sensitiveWordsFilter.check(text);
}

// 过滤敏感词（替换为星号）
export function filterSensitiveWords(text: string): string {
  return sensitiveWordsFilter.clean(text);
}

// 保留原有的简单词汇列表用于快速检查
const basicSensitiveWords = [
  '杀', '死', '血', '暴力', '恐怖', '残忍',
  '裸', '性', '色情', '成人', '情色',
  '政治', '革命', '政府', '领导人',
  '仇恨', '歧视', '种族', '宗教冲突',
  '毒品', '赌博', '诈骗', '盗窃', '走私'
];

// 快速检查函数（用于性能关键场景）
export function quickSensitiveCheck(text: string): boolean {
  const lowerText = text.toLowerCase();
  return basicSensitiveWords.some(word => lowerText.includes(word));
}

// 原有的过滤函数实现（兼容性）
function legacyFilterSensitiveWords(text: string): string {
  let filteredText = text
  
  basicSensitiveWords.forEach(word => {
    const regex = new RegExp(word, 'gi')
    filteredText = filteredText.replace(regex, '*'.repeat(word.length))
  })
  
  return filteredText
}

// CSRF 功能已移至 ./csrf.ts

// 输入验证中间件
export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): { success: boolean; data?: T; error?: string } {
  try {
    const result = schema.parse(input)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map(e => e.message).join(', ')
      return { success: false, error: message }
    }
    return { success: false, error: '输入验证失败' }
  }
}

// 密码强度检查
export function checkPasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  // 长度检查
  if (password.length >= 8) score += 1
  else feedback.push('密码至少需要8位')
  
  if (password.length >= 12) score += 1
  
  // 复杂度检查
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('需要包含小写字母')
  
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('需要包含大写字母')
  
  if (/\d/.test(password)) score += 1
  else feedback.push('需要包含数字')
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  else feedback.push('建议包含特殊字符')
  
  // 常见模式检查
  if (!/(.)\1{2,}/.test(password)) score += 1
  else feedback.push('避免连续相同字符')
  
  return { score, feedback }
}

// 用户输入日志记录（用于安全监控）
export function logSecurityEvent(event: {
  type: 'input_validation_failed' | 'rate_limit_exceeded' | 'suspicious_activity'
  userId?: string
  ip?: string
  userAgent?: string
  details: any
}) {
  // 这里可以集成到日志系统或安全监控服务
  console.log(`[SECURITY] ${event.type}:`, JSON.stringify(event, null, 2))
  
  // 在生产环境中，您可能想要发送到监控服务
  // 例如：Sentry, DataDog, 或自定义日志服务
}

// CSRF Token 验证辅助函数
export function validateCSRFToken(request: Request): { valid: boolean; error?: string } {
  try {
    const token = request.headers.get('x-csrf-token') || 
                 request.headers.get('X-CSRF-Token');
    
    if (!token) {
      return { valid: false, error: '缺少CSRF token' };
    }
    
    // 从请求中获取 session ID
    const cookies = request.headers.get('cookie') || '';
    const sessionId = cookies.match(/session-id=([^;]+)/)?.[1] || 
                     request.headers.get('x-session-id') || 
                     'anonymous';
    
    const isValid = CSRFProtection.validateToken(token, sessionId);
    
    return { 
      valid: isValid, 
      error: isValid ? undefined : 'CSRF token无效或已过期' 
    };
  } catch (error) {
    return { valid: false, error: 'CSRF token验证失败' };
  }
}

// 导出所有安全相关的功能
// Rate limiters are exported directly from rate-limiter-factory
// createRateLimitResponse is exported from rate-limiter-wrapper