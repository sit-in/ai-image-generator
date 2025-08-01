#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 修复 API 问题...\n');

// 1. 创建一个简化的速率限制器包装器，用于处理普通 Request 对象
const rateLimiterWrapperContent = `import { NextRequest } from 'next/server'

// 简单的内存存储速率限制器
const requestCounts = new Map();

export function checkRateLimit(request: Request, config: { windowMs: number, maxRequests: number }) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const key = \`\${ip}:\${config.windowMs}\`;
  const now = Date.now();
  
  // 获取或创建记录
  let record = requestCounts.get(key) || { count: 0, resetTime: now + config.windowMs };
  
  // 如果超过时间窗口，重置
  if (now > record.resetTime) {
    record = { count: 0, resetTime: now + config.windowMs };
  }
  
  // 增加计数
  record.count++;
  requestCounts.set(key, record);
  
  // 检查是否超限
  const allowed = record.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - record.count);
  
  return {
    allowed,
    remaining,
    resetTime: record.resetTime
  };
}

// 清理过期记录
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 60000); // 每分钟清理一次
`;

// 2. 创建一个环境变量检查器
const envCheckerContent = `export function checkRequiredEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'REPLICATE_API_TOKEN'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ 缺少必需的环境变量:', missing.join(', '));
    throw new Error('Missing required environment variables');
  }
  
  return true;
}
`;

// 写入文件
try {
  // 创建速率限制器包装器
  const rateLimiterPath = path.join(process.cwd(), 'lib', 'rate-limiter-wrapper.ts');
  fs.writeFileSync(rateLimiterPath, rateLimiterWrapperContent);
  console.log('✅ 创建速率限制器包装器:', rateLimiterPath);
  
  // 创建环境变量检查器
  const envCheckerPath = path.join(process.cwd(), 'lib', 'env-checker.ts');
  fs.writeFileSync(envCheckerPath, envCheckerContent);
  console.log('✅ 创建环境变量检查器:', envCheckerPath);
  
  console.log('\n📝 修复建议：');
  console.log('1. 在 API 路由中使用 rate-limiter-wrapper 替代原有的速率限制器');
  console.log('2. 在 API 路由开始时调用 checkRequiredEnv() 确保环境变量存在');
  console.log('3. 为所有 API 添加 try-catch 错误处理');
  console.log('4. 确保所有 API 都正确处理游客模式');
  
} catch (error) {
  console.error('❌ 修复失败:', error);
  process.exit(1);
}

console.log('\n✅ 修复脚本执行完成！');