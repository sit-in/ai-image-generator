const fs = require('fs');
const path = require('path');

console.log('清理 Next.js 缓存...');

const cacheDirectories = [
  '.next',
  'node_modules/.cache',
  '.turbo'
];

cacheDirectories.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`删除 ${dir}...`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

console.log('缓存清理完成！');
console.log('提示：运行 npm run dev 重新启动开发服务器');