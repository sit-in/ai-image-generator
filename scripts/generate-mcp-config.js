#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// 读取模板文件
const templatePath = path.join(process.cwd(), '.mcp.json.template');
const outputPath = path.join(process.cwd(), '.mcp.json');

try {
  // 读取模板
  const template = fs.readFileSync(templatePath, 'utf8');
  
  // 替换环境变量
  const config = template
    .replace('{{SUPABASE_PROJECT_REF}}', process.env.SUPABASE_PROJECT_REF || '')
    .replace('{{SUPABASE_ACCESS_TOKEN}}', process.env.SUPABASE_ACCESS_TOKEN || '');
  
  // 验证必需的环境变量
  if (!process.env.SUPABASE_PROJECT_REF || !process.env.SUPABASE_ACCESS_TOKEN) {
    console.error('❌ 错误：缺少必需的环境变量');
    console.error('请确保 .env.local 中包含:');
    console.error('  - SUPABASE_PROJECT_REF');
    console.error('  - SUPABASE_ACCESS_TOKEN');
    process.exit(1);
  }
  
  // 写入配置文件
  fs.writeFileSync(outputPath, config);
  
  console.log('✅ MCP 配置文件已生成: .mcp.json');
  console.log('配置信息:');
  console.log(`  - Project Ref: ${process.env.SUPABASE_PROJECT_REF}`);
  console.log(`  - Access Token: ${process.env.SUPABASE_ACCESS_TOKEN.substring(0, 10)}...`);
  
} catch (error) {
  console.error('❌ 生成 MCP 配置失败:', error.message);
  process.exit(1);
}