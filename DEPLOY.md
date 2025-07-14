# 部署指南

## Vercel 部署配置

### 1. 项目设置

在 Vercel 仪表板中：

- **Framework Preset**: Next.js
- **Root Directory**: `./` (项目根目录)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (自动检测)
- **Install Command**: `npm install`

### 2. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
REPLICATE_API_TOKEN=your_replicate_api_token
REPLICATE_MODEL=black-forest-labs/flux-schnell
```

### 3. 函数配置

项目已配置：
- API 路由最大执行时间：300秒（5分钟）
- 部署区域：iad1（美国东部）

### 4. 部署步骤

1. **连接 GitHub 仓库**
   - 在 Vercel 中导入项目
   - 选择 `sit-in/ai-image-generator` 仓库

2. **配置项目设置**
   - Root Directory: `./`
   - Framework: Next.js (自动检测)

3. **添加环境变量**
   - 在项目设置中添加上述环境变量

4. **部署**
   - 点击 Deploy
   - 等待构建完成

### 5. 域名设置

部署成功后：
- 系统会自动分配 `.vercel.app` 域名
- 可以在项目设置中添加自定义域名

### 6. 故障排除

**包管理器冲突**：
- 项目使用 npm，确保删除 `pnpm-lock.yaml`
- Vercel 配置已设置 `"packageManager": "npm"`
- 使用 `npm ci` 进行可靠的依赖安装

**构建失败**：
- 检查环境变量是否正确设置
- 确认 Supabase 配置有效
- 查看构建日志中的错误信息
- 确保只有 `package-lock.json`，无其他锁文件

**API 超时**：
- API 路由已配置 5 分钟超时
- 如需更长时间，可升级 Vercel 计划

**图片生成失败**：
- 检查 Replicate API Token 是否有效
- 确认 Supabase Storage 权限配置正确

**模块加载错误**：
- 清理 `.next` 缓存
- 重新安装依赖：`rm -rf node_modules && npm install`
- 检查 TypeScript 配置路径映射

### 7. 监控和分析

建议在 Vercel 中启用：
- 性能监控
- 错误追踪
- 分析数据

---

> **注意**: 确保所有密钥和令牌都正确配置，并且 Supabase 项目已正确设置 RLS 策略。