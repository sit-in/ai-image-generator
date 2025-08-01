# 生产环境部署指南

本文档详细说明了如何将 AI 图片生成器部署到生产环境。

## 目录

1. [环境变量配置](#环境变量配置)
2. [安全配置](#安全配置)
3. [Redis 配置](#redis-配置)
4. [性能优化](#性能优化)
5. [监控和日志](#监控和日志)
6. [部署检查清单](#部署检查清单)

## 环境变量配置

### 必需的环境变量

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Replicate API
REPLICATE_API_TOKEN=your-replicate-token
REPLICATE_MODEL=black-forest-labs/flux-schnell

# 安全配置（生产环境必需）
CSRF_SECRET=your-32-char-secret  # 使用 openssl rand -hex 32 生成
NODE_ENV=production
```

### 推荐的环境变量

```bash
# Redis 配置（强烈推荐）
REDIS_URL=redis://username:password@your-redis-host:6379/0

# 站点配置
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# 监控配置（可选）
SENTRY_DSN=your-sentry-dsn
OPENTELEMETRY_ENDPOINT=your-otel-endpoint
```

## 安全配置

### 1. CSRF 保护

CSRF_SECRET 必须是至少 32 字符的随机字符串：

```bash
# 生成 CSRF_SECRET
openssl rand -hex 32
```

### 2. 管理员权限

确保管理员账户设置正确：

```sql
-- 设置管理员权限
UPDATE profiles 
SET is_admin = true 
WHERE email = 'admin@example.com';
```

### 3. 安全头配置

项目已包含安全头配置，确保 `next-security.config.js` 文件存在。

### 4. 敏感词过滤

系统包含敏感词过滤功能，会自动过滤不当内容。

## Redis 配置

### 为什么需要 Redis？

1. **速率限制**：在多实例部署时保持一致的速率限制
2. **会话管理**：跨实例共享会话数据
3. **缓存**：提高性能

### Redis 部署选项

#### 1. 使用 Redis Cloud（推荐）

```bash
# Redis Cloud 免费层提供 30MB 存储
REDIS_URL=redis://default:password@redis-12345.c123.us-east-1-2.ec2.cloud.redislabs.com:12345
```

#### 2. 使用 Upstash（Serverless Redis）

```bash
# Upstash 提供按请求计费的 Redis
REDIS_URL=https://your-endpoint.upstash.io
```

#### 3. 自托管 Redis

```bash
# Docker 部署
docker run -d \
  --name redis \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:7-alpine \
  redis-server --requirepass your-password
```

### Redis 连接测试

```bash
# 测试 Redis 连接
npm run test:redis
```

## 性能优化

### 1. 图片存储 CDN

配置 Supabase Storage CDN：

```javascript
// 在 Supabase 控制台启用 CDN
// 或使用自定义 CDN
IMAGE_CDN_URL=https://cdn.your-domain.com
```

### 2. 构建优化

```bash
# 生产构建
npm run build

# 分析包大小
npm run analyze
```

### 3. 数据库索引

确保以下索引已创建：

```sql
-- 用户积分查询优化
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);

-- 生成历史查询优化
CREATE INDEX idx_generation_history_user_id ON generation_history(user_id);
CREATE INDEX idx_generation_history_created_at ON generation_history(created_at DESC);

-- 兑换码查询优化
CREATE INDEX idx_redeem_codes_code ON redeem_codes(code);
CREATE INDEX idx_redeem_codes_used ON redeem_codes(used);
```

## 监控和日志

### 1. 应用监控

推荐集成以下监控服务之一：

- **Sentry**：错误跟踪
- **DataDog**：APM 和日志
- **New Relic**：性能监控

### 2. 日志配置

```javascript
// 生产环境日志级别
LOG_LEVEL=info

// 日志输出格式
LOG_FORMAT=json
```

### 3. 健康检查端点

系统提供健康检查端点：

```bash
# 健康检查
GET /api/health

# 详细状态
GET /api/health/detailed
```

## 部署检查清单

### 部署前检查

- [ ] 所有环境变量已配置
- [ ] CSRF_SECRET 已设置为强随机值
- [ ] Redis 已配置（或接受内存限制）
- [ ] 数据库备份已设置
- [ ] SSL 证书已配置

### 安全检查

- [ ] 管理员账户已正确设置
- [ ] 敏感环境变量未暴露在代码中
- [ ] 安全头已启用
- [ ] CORS 配置正确

### 性能检查

- [ ] 数据库索引已创建
- [ ] 图片存储 CDN 已配置
- [ ] 构建优化已完成
- [ ] 静态资源已压缩

### 监控检查

- [ ] 错误跟踪已配置
- [ ] 性能监控已启用
- [ ] 日志收集已设置
- [ ] 告警规则已配置

## 常见问题

### 1. Redis 连接失败

如果 Redis 不可用，系统会自动降级到内存存储，但会有以下限制：

- 速率限制仅在单实例内有效
- 重启后速率限制计数器会重置
- 不适合多实例部署

### 2. 构建错误

确保以下设置：

```javascript
// next.config.mjs
typescript: {
  ignoreBuildErrors: false  // 生产环境应该修复所有类型错误
}
```

### 3. 内存使用过高

检查以下配置：

- 图片处理是否正确清理
- 速率限制器是否定期清理过期数据
- 是否有内存泄漏

## 部署脚本示例

```bash
#!/bin/bash
# deploy.sh

# 设置环境变量
export NODE_ENV=production

# 安装依赖
npm ci --production

# 运行数据库迁移
npm run db:migrate

# 构建应用
npm run build

# 启动应用
npm start
```

## 结语

遵循本指南可以确保您的 AI 图片生成器在生产环境中安全、稳定、高效地运行。如有问题，请参考项目 README 或提交 Issue。