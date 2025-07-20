# AI图片生成模型推荐

## 当前问题
使用 `black-forest-labs/flux-schnell` 模型存在以下问题：
- 生成速度快但质量较低
- 风格控制不够精准
- 细节和清晰度不足

## 推荐模型对比

### 1. **Stable Diffusion XL (SDXL)** ⭐⭐⭐⭐⭐
```env
REPLICATE_MODEL=stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b
```
- **优点**: 质量高、风格控制好、社区支持广
- **缺点**: 生成速度稍慢（15-20秒）
- **适合**: 追求质量的商业应用

### 2. **Flux Dev** ⭐⭐⭐⭐
```env
REPLICATE_MODEL=black-forest-labs/flux-dev
```
- **优点**: 比Schnell质量高很多，风格更准确
- **缺点**: 速度比Schnell慢
- **适合**: 平衡速度和质量

### 3. **Stable Diffusion 3** ⭐⭐⭐⭐
```env
REPLICATE_MODEL=stability-ai/stable-diffusion-3
```
- **优点**: 最新技术，文字理解能力强
- **缺点**: 成本较高
- **适合**: 高端应用

### 4. **专门的动漫模型** ⭐⭐⭐⭐⭐
```env
# 对于动漫风格
REPLICATE_MODEL=cjwbw/animagine-xl-3.1:8687930b4faa1246bb7e8496c9ec5c84ff5bdf32c46f45fa5ffcab48fbab2fe7
```
- **优点**: 动漫风格极其准确
- **缺点**: 只适合动漫风格
- **适合**: 专注二次元市场

## 实施建议

### 方案一：单一高质量模型（推荐）
修改 `.env.local`:
```env
REPLICATE_MODEL=stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b
```

### 方案二：多模型支持
修改 `app/api/generate-image/route.ts`:
```typescript
// 根据风格选择不同模型
const modelMap = {
  'anime': 'cjwbw/animagine-xl-3.1:8687930b4faa1246bb7e8496c9ec5c84ff5bdf32c46f45fa5ffcab48fbab2fe7',
  'natural': 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
  'oil': 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
  'watercolor': 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
  'pixel': 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
  'ghibli': 'cjwbw/animagine-xl-3.1:8687930b4faa1246bb7e8496c9ec5c84ff5bdf32c46f45fa5ffcab48fbab2fe7'
};

const model = modelMap[style] || process.env.REPLICATE_MODEL;
```

### 方案三：增强提示词
为SDXL优化提示词格式：
```typescript
// 在 prompt-optimizer.ts 中添加
const sdxlOptimize = (prompt: string, style: string) => {
  const sdxlPrefix = {
    'anime': 'anime artwork, anime style, key visual, vibrant, studio anime,',
    'oil': 'oil painting, traditional media, painterly, brushstrokes visible,',
    'watercolor': 'watercolor painting, soft edges, fluid, transparent medium,',
    'pixel': 'pixel art, 8bit, retro gaming, pixelated,',
    'ghibli': 'studio ghibli style, hayao miyazaki, anime movie,'
  };
  
  return `${sdxlPrefix[style] || ''} ${prompt}, highly detailed, sharp focus, trending on artstation`;
};
```

## 成本考虑

| 模型 | 每张图片成本 | 生成时间 | 质量评分 |
|------|------------|---------|---------|
| Flux-Schnell | $0.001 | 5-10秒 | ⭐⭐⭐ |
| SDXL | $0.003 | 15-20秒 | ⭐⭐⭐⭐⭐ |
| Flux-Dev | $0.002 | 10-15秒 | ⭐⭐⭐⭐ |
| SD3 | $0.005 | 20-30秒 | ⭐⭐⭐⭐⭐ |

## 立即行动

1. **先测试SDXL**：
   ```bash
   # 更新环境变量
   REPLICATE_MODEL=stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b
   ```

2. **重启服务**：
   ```bash
   npm run dev
   ```

3. **测试生成效果**

这样可以立即提升图片质量，而不需要修改任何代码！