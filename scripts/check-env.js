#!/usr/bin/env node

const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// 必需的环境变量
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'REPLICATE_API_TOKEN'
];

// 推荐的环境变量
const recommendedVars = [
  'CSRF_SECRET',
  'REDIS_URL',
  'NODE_ENV'
];

console.log('🔍 Checking environment variables...\n');

let hasErrors = false;
const warnings = [];

// 检查必需的变量
console.log('Required variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`  ❌ ${varName}: NOT SET`);
    hasErrors = true;
  } else {
    const maskedValue = value.substring(0, 8) + '...';
    console.log(`  ✅ ${varName}: ${maskedValue}`);
  }
});

console.log('\nRecommended variables:');
recommendedVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`  ⚠️  ${varName}: NOT SET`);
    if (varName === 'CSRF_SECRET' && process.env.NODE_ENV === 'production') {
      warnings.push('CSRF_SECRET is required in production for security');
    }
    if (varName === 'REDIS_URL' && process.env.NODE_ENV === 'production') {
      warnings.push('REDIS_URL is recommended in production for proper rate limiting');
    }
  } else {
    const maskedValue = value.substring(0, 8) + '...';
    console.log(`  ✅ ${varName}: ${maskedValue}`);
  }
});

// 检查 Supabase URL 格式
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
  } catch (e) {
    console.log('\n❌ NEXT_PUBLIC_SUPABASE_URL is not a valid URL');
    hasErrors = true;
  }
}

// 显示结果
console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('\n❌ Environment validation FAILED');
  console.log('\nPlease set all required environment variables in your .env.local file');
  console.log('See .env.example for reference\n');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set');
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  console.log('\n');
}