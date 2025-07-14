# 🚀 支付系统快速启动指南

> 这是一个简化的快速启动指南，帮助您快速开始支付系统的实施。
> 完整的详细方案请参考：[payment-system-implementation-guide.md](./payment-system-implementation-guide.md)

## 🎯 30分钟快速开始

### 1. 注册支付账户（5分钟）
```bash
# 访问以下链接注册账户
https://dashboard.stripe.com/register     # Stripe注册
https://developer.paypal.com/             # PayPal开发者账户
```

### 2. 获取API密钥（5分钟）
```bash
# Stripe密钥获取路径
Dashboard → 开发者 → API密钥

# PayPal密钥获取路径  
创建应用 → 获取Client ID和Secret
```

### 3. 环境变量配置（5分钟）
```bash
# 添加到 .env.local
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

### 4. 安装依赖（5分钟）
```bash
npm install stripe @paypal/checkout-server-sdk
npm install --save-dev @types/stripe
```

### 5. 数据库迁移（10分钟）
```bash
# 在 supabase/migrations/ 目录创建新迁移文件
# 复制完整的SQL脚本（见详细文档）
supabase migration up
```

## 📋 实施检查清单

### 阶段一：基础设置 ✅
- [ ] Stripe账户注册并获取API密钥
- [ ] PayPal开发者账户注册并获取密钥
- [ ] 环境变量配置完成
- [ ] 依赖包安装完成
- [ ] 数据库迁移完成

### 阶段二：核心开发 ✅
- [ ] 支付服务类实现
- [ ] 支付处理器实现
- [ ] API路由创建
- [ ] 前端组件开发
- [ ] Webhook处理实现

### 阶段三：测试验证 ✅
- [ ] 单元测试编写
- [ ] 集成测试完成
- [ ] 支付流程测试
- [ ] 安全性测试
- [ ] 性能测试

### 阶段四：部署上线 ✅
- [ ] 生产环境配置
- [ ] Webhook端点设置
- [ ] 域名SSL配置
- [ ] 监控告警设置
- [ ] 上线验证

## 🎛️ 关键配置文件

### package.json 新增依赖
```json
{
  "dependencies": {
    "stripe": "^14.0.0",
    "@paypal/checkout-server-sdk": "^1.0.3"
  },
  "devDependencies": {
    "@types/stripe": "^8.0.0"
  }
}
```

### next.config.mjs 配置
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  },
}

export default nextConfig
```

## 🔧 核心文件创建顺序

### 1. 基础配置文件
```
lib/payment-config.ts          # 支付配置管理
lib/payment-processor.ts       # 支付处理器接口
lib/payment-factory.ts         # 支付工厂类
```

### 2. 服务实现文件
```
lib/payment-service.ts         # 支付服务主类
lib/processors/stripe-processor.ts   # Stripe处理器
lib/processors/paypal-processor.ts   # PayPal处理器
```

### 3. API路由文件
```
app/api/payment/packages/route.ts     # 套餐管理
app/api/payment/create-order/route.ts # 创建订单
app/api/payment/stripe/confirm/route.ts # Stripe确认
app/api/payment/paypal/capture/route.ts # PayPal捕获
```

### 4. 前端组件文件
```
components/payment/payment-packages.tsx        # 套餐选择
components/payment/stripe-payment-form.tsx     # Stripe支付表单
components/payment/paypal-payment-button.tsx   # PayPal支付按钮
components/payment/payment-success.tsx         # 支付成功页面
```

## ⚡ 测试命令

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行覆盖率测试
npm run test:coverage
```

## 🚨 常见问题解决

### Q1: Stripe Webhook验证失败
```bash
# 检查webhook密钥是否正确
echo $STRIPE_WEBHOOK_SECRET

# 检查webhook端点URL是否正确
# 应该是: https://yourdomain.com/api/payment/webhooks/stripe
```

### Q2: PayPal沙盒环境问题
```bash
# 确保使用沙盒环境的密钥
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
```

### Q3: 数据库迁移失败
```bash
# 检查Supabase连接
supabase status

# 重置并重新迁移
supabase db reset
supabase migration up
```

## 🎯 下一步行动

### 立即开始：
1. **复制环境变量模板**到你的 `.env.local`
2. **运行数据库迁移**脚本
3. **创建第一个API路由**进行测试
4. **集成Stripe支付组件**到充值页面

### 48小时内完成：
- 基础支付功能开发
- 简单的前端集成
- 基本的测试验证

### 一周内完成：
- 完整的支付流程
- 全面的测试覆盖
- 生产环境部署

## 📞 获取帮助

如果在实施过程中遇到问题，可以：
1. 查看详细的实施指南文档
2. 检查官方API文档
3. 参考测试用例代码
4. 联系技术支持团队

---

**快速启动提示**: 建议先在测试环境完成整个流程，确保一切正常后再部署到生产环境。

*最后更新: 2024-07-14*