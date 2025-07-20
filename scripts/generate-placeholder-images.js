const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// 创建示例图片的函数
function createPlaceholderImage(text, style, filename) {
  const width = 512;
  const height = 512;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 根据风格设置背景颜色
  const colors = {
    '动漫风格': { bg: '#FFE5F1', text: '#FF6B9D' },
    '赛博朋克': { bg: '#1A1A2E', text: '#F39C12' },
    '油画风格': { bg: '#F4E04D', text: '#A05C12' },
    '水彩风格': { bg: '#B8E0FF', text: '#2E86AB' },
    '像素风格': { bg: '#8B5CF6', text: '#FFFFFF' },
    '吉卜力风格': { bg: '#C7F2E3', text: '#2A9D8F' },
    '自然风格': { bg: '#E8F5E9', text: '#2E7D32' },
    '蒸汽朋克': { bg: '#8B4513', text: '#FFD700' }
  };

  const color = colors[style] || { bg: '#F0F0F0', text: '#333333' };

  // 绘制背景
  ctx.fillStyle = color.bg;
  ctx.fillRect(0, 0, width, height);

  // 绘制装饰图案
  ctx.strokeStyle = color.text;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.3;
  
  // 绘制一些简单的装饰线条
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, 0);
    ctx.lineTo(Math.random() * width, height);
    ctx.stroke();
  }
  
  ctx.globalAlpha = 1;

  // 绘制文字
  ctx.fillStyle = color.text;
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 分行显示风格名称
  const lines = style.split('');
  lines.forEach((char, index) => {
    ctx.fillText(char, width / 2, height / 2 - 50 + index * 60);
  });

  // 保存图片
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
  fs.writeFileSync(filename, buffer);
  console.log(`生成图片: ${filename}`);
}

// 生成 placeholder 图片的简单版本
function createSimplePlaceholder() {
  const width = 512;
  const height = 512;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 渐变背景
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 中心圆形
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 150, 0, Math.PI * 2);
  ctx.fill();

  // 文字
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AI ART', width / 2, height / 2);

  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
  fs.writeFileSync(path.join(__dirname, '../public/placeholder.jpg'), buffer);
  console.log('生成默认 placeholder.jpg');
}

// 检查是否安装了 canvas
try {
  createSimplePlaceholder();
} catch (error) {
  console.log('需要安装 canvas 包来生成图片');
  console.log('请运行: npm install canvas');
  
  // 如果没有 canvas，使用 base64 创建简单的图片
  const simpleBase64 = `data:image/svg+xml;base64,${Buffer.from(`
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="url(#grad)"/>
      <circle cx="256" cy="256" r="150" fill="rgba(255,255,255,0.2)"/>
      <text x="256" y="256" font-family="Arial" font-size="36" font-weight="bold" fill="white" text-anchor="middle" alignment-baseline="middle">AI ART</text>
    </svg>
  `).toString('base64')}`;
  
  console.log('创建 SVG 版本的占位图...');
}