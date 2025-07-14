# 📚 项目文档目录

欢迎来到 AI 图像生成服务的文档中心！这里包含了项目的各种文档资源。

## 📋 文档列表

### 🚀 支付系统相关
- **[支付系统完整实施方案](./payment-system-implementation-guide.md)** - 详细的支付系统接入指南，包含海外支付解决方案
- **[支付系统快速启动指南](./payment-system-quick-start.md)** - 30分钟快速开始支付系统实施
- **[支付系统代码模板](./payment-system-code-templates.md)** - 完整的代码模板集合，可直接复制使用

### 🎯 产品开发相关
- **[MVP产品规划](./mvp.md)** - 最小可行产品规划文档
- **[Claude Code 使用指南](./claude-code/)** - Claude Code 工具的使用说明

## 🎯 如何使用这些文档

### 📖 支付系统实施
如果您需要为项目添加支付功能，建议按以下顺序阅读：

1. **首先阅读**: [支付系统完整实施方案](./payment-system-implementation-guide.md)
   - 了解整体架构设计
   - 掌握技术选型理由
   - 理解实施路线图

2. **快速开始**: [支付系统快速启动指南](./payment-system-quick-start.md)
   - 30分钟快速配置环境
   - 获取必要的API密钥
   - 完成基础设置

3. **代码实现**: [支付系统代码模板](./payment-system-code-templates.md)
   - 复制完整的代码模板
   - 根据需求进行定制
   - 按步骤实施功能

### 🔧 开发流程建议

#### 阶段一：准备工作（1-2小时）
1. 注册 Stripe 和 PayPal 开发者账户
2. 获取 API 密钥和配置信息
3. 配置环境变量
4. 安装必要的依赖包

#### 阶段二：基础开发（1-2天）
1. 创建数据库迁移脚本
2. 实现核心支付服务类
3. 创建 API 路由
4. 开发前端支付组件

#### 阶段三：集成测试（1天）
1. 编写单元测试
2. 进行集成测试
3. 测试支付流程
4. 验证安全性

#### 阶段四：部署上线（半天）
1. 配置生产环境
2. 设置 Webhook 端点
3. 部署和监控
4. 上线验证

## 🛠️ 技术栈说明

### 后端技术栈
- **框架**: Next.js 14 (App Router)
- **数据库**: Supabase PostgreSQL
- **认证**: Supabase Auth
- **支付**: Stripe + PayPal
- **语言**: TypeScript

### 前端技术栈
- **框架**: React 18
- **样式**: Tailwind CSS
- **组件库**: shadcn/ui
- **支付组件**: @stripe/react-stripe-js

### 开发工具
- **版本控制**: Git
- **包管理**: npm
- **测试**: Jest
- **代码检查**: ESLint + Prettier

## 📊 项目结构

```
ai-image-generator/
├── docs/                          # 文档目录
│   ├── payment-system-implementation-guide.md
│   ├── payment-system-quick-start.md
│   ├── payment-system-code-templates.md
│   └── README.md
├── lib/                           # 核心库文件
│   ├── payment-service.ts
│   ├── payment-config.ts
│   └── processors/
├── app/api/payment/              # 支付 API 路由
│   ├── create-order/
│   ├── stripe/
│   └── webhooks/
├── components/payment/           # 支付相关组件
│   ├── payment-packages.tsx
│   ├── stripe-payment-form.tsx
│   └── payment-success.tsx
└── tests/                        # 测试文件
    ├── payment-service.test.ts
    └── api/
```

## 🔗 相关链接

### 官方文档
- [Stripe API 文档](https://stripe.com/docs/api)
- [PayPal API 文档](https://developer.paypal.com/api/rest/)
- [Supabase 文档](https://supabase.com/docs)
- [Next.js 文档](https://nextjs.org/docs)

### 开发工具
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [PayPal Developer Dashboard](https://developer.paypal.com/)
- [Supabase Dashboard](https://app.supabase.com/)

### 测试工具
- [Stripe 测试卡号](https://stripe.com/docs/testing)
- [PayPal 沙盒环境](https://developer.paypal.com/developer/applications/)

## 📞 获取帮助

如果在使用文档或实施过程中遇到问题，您可以：

1. **查看相关文档**: 详细阅读对应的文档章节
2. **检查代码模板**: 对比代码模板确认实现是否正确
3. **查看测试用例**: 参考测试用例了解预期行为
4. **查阅官方文档**: 查看第三方服务的官方文档

## 🎯 文档更新

- **当前版本**: 1.0
- **最后更新**: 2024-07-14
- **维护者**: Claude Code
- **更新频率**: 根据项目进展定期更新

## 🔄 版本历史

### v1.0 (2024-07-14)
- 创建支付系统完整实施方案
- 添加快速启动指南
- 提供完整的代码模板
- 建立文档目录结构

---

**欢迎使用这些文档！如果您有任何建议或发现错误，请及时反馈以便我们改进。**