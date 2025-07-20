const fs = require('fs');
const path = require('path');

// 创建 SVG 格式的占位图片 - 与内联生成器的6种风格保持一致
const styles = [
  { name: 'natural', gradient: ['#E8F5E9', '#2E7D32'], emoji: '🌿', displayName: '自然' },
  { name: 'anime', gradient: ['#FFE5F1', '#FF6B9D'], emoji: '✨', displayName: '动漫' },
  { name: 'oil', gradient: ['#F4E04D', '#A05C12'], emoji: '🎨', displayName: '油画' },
  { name: 'watercolor', gradient: ['#B8E0FF', '#2E86AB'], emoji: '💧', displayName: '水彩' },
  { name: 'pixel', gradient: ['#8B5CF6', '#EC4899'], emoji: '👾', displayName: '像素' },
  { name: 'ghibli', gradient: ['#C7F2E3', '#2A9D8F'], emoji: '🏰', displayName: '吉卜力' }
];

// 为了填充8个位置，创建变体
const allStyles = [
  ...styles,
  { name: 'natural-2', gradient: ['#C8E6C9', '#388E3C'], emoji: '🌿', displayName: '自然' },
  { name: 'anime-2', gradient: ['#FCE4EC', '#E91E63'], emoji: '✨', displayName: '动漫' }
];

// 确保目录存在
const galleryDir = path.join(__dirname, '../public/gallery');
if (!fs.existsSync(galleryDir)) {
  fs.mkdirSync(galleryDir, { recursive: true });
}

allStyles.forEach((style, index) => {
  const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${style.gradient[0]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${style.gradient[1]};stop-opacity:1" />
    </linearGradient>
    <pattern id="pattern${index}" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
      <circle cx="25" cy="25" r="2" fill="${style.gradient[1]}" opacity="0.3"/>
    </pattern>
  </defs>
  
  <!-- 背景 -->
  <rect width="512" height="512" fill="url(#grad${index})"/>
  
  <!-- 图案 -->
  <rect width="512" height="512" fill="url(#pattern${index})"/>
  
  <!-- 中心装饰 -->
  <circle cx="256" cy="256" r="120" fill="white" opacity="0.1"/>
  <circle cx="256" cy="256" r="80" fill="white" opacity="0.15"/>
  
  <!-- Emoji -->
  <text x="256" y="256" font-family="Arial" font-size="64" text-anchor="middle" alignment-baseline="middle">${style.emoji}</text>
  
  <!-- 风格名称 -->
  <text x="256" y="350" font-family="Arial" font-size="24" font-weight="bold" fill="white" text-anchor="middle" opacity="0.8">${style.displayName}</text>
</svg>`;

  const filename = path.join(galleryDir, `${style.name}-style.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`创建占位图: ${filename}`);
});

console.log('\n✅ 成功生成所有占位图片！');
console.log('已创建以下文件：');
allStyles.forEach(style => {
  console.log(`  - /gallery/${style.name}-style.svg (${style.displayName})`);
});