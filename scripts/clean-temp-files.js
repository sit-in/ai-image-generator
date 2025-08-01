#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 清理临时文件...\n');

// 要清理的临时文件模式
const tempPatterns = [
  '*_FIX*.md',
  '*_TEST*.md',
  '*_REPORT*.md',
  '*_SUMMARY*.md',
  'FIX_*.md',
  'TEST_*.md',
  'FINAL_*.md'
];

// 要保留的重要文件
const keepFiles = [
  'README.md',
  'SECURITY.md',
  'DEPLOYMENT-GUIDE.md',
  'PROJECT_DOCUMENTATION.md',
  'BEIAN-INFO.md',
  'DEPLOY.md',
  'MODEL_RECOMMENDATIONS.md',
  'DYNAMIC_GALLERY_SUMMARY.md'
];

const rootDir = path.join(__dirname, '..');
const files = fs.readdirSync(rootDir);

let deletedCount = 0;

files.forEach(file => {
  // 只处理 .md 文件
  if (!file.endsWith('.md')) return;
  
  // 检查是否在保留列表中
  if (keepFiles.includes(file)) return;
  
  // 检查是否匹配临时文件模式
  const isTemp = tempPatterns.some(pattern => {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return regex.test(file);
  });
  
  if (isTemp) {
    const filePath = path.join(rootDir, file);
    try {
      fs.unlinkSync(filePath);
      console.log(`❌ 删除: ${file}`);
      deletedCount++;
    } catch (error) {
      console.error(`⚠️  无法删除 ${file}:`, error.message);
    }
  }
});

console.log(`\n✅ 清理完成！删除了 ${deletedCount} 个临时文件。`);

// 同时清理测试结果目录
const testDirs = ['playwright-report', 'test-results', '.nyc_output'];
testDirs.forEach(dir => {
  const dirPath = path.join(rootDir, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`\n🗑️  清理目录: ${dir}`);
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ 已删除: ${dir}`);
    } catch (error) {
      console.error(`⚠️  无法删除 ${dir}:`, error.message);
    }
  }
});

console.log('\n💡 提示：如果需要保留某些文件，请将它们添加到 keepFiles 列表中。');