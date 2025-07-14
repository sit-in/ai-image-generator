# AI 图片生成器

> 基于 Next.js 14 和 Replicate API 的商业化 AI 图片生成服务

一个功能完整的 AI 图片生成平台，支持多种艺术风格，包含完整的用户系统、积分管理和图片存储功能。

## ✨ 核心功能

- 🎨 **多风格图片生成**：支持自然、动漫、油画、水彩、像素、吉卜力等 6 种艺术风格
- 👤 **用户认证系统**：基于 Supabase Auth 的完整注册登录功能
- 💰 **积分系统**：新用户赠送 30 积分，每张图片消耗 10 积分
- 🎫 **兑换码系统**：支持 BASIC(100)、STANDARD(300)、PREMIUM(1000) 三档兑换码
- 📁 **永久存储**：图片存储在 Supabase Storage，永久保存
- 📊 **生成历史**：查看个人创作历史，支持重新生成和下载
- 🛡️ **内容安全**：内置 NSFW 检测，确保生成内容健康
- 👨‍💼 **管理面板**：完整的管理后台，支持兑换码生成和用户管理

## 🛠️ 技术栈

- **框架**：Next.js 14 (App Router)
- **UI 库**：shadcn/ui + Tailwind CSS
- **数据库**：Supabase PostgreSQL
- **认证**：Supabase Auth
- **存储**：Supabase Storage
- **AI 模型**：Replicate (Flux-Schnell)
- **部署**：Vercel

## 🚀 快速开始

### 环境要求

- Node.js 18.0+
- npm/pnpm 包管理器

### 安装步骤

1. **克隆项目**
```bash
git clone git@github.com:sit-in/ai-image-generator.git
cd ai-image-generator
```

2. **安装依赖**
```bash
npm install
```

3. **环境配置**
创建 `.env.local` 文件：
```env
# Supabase (必需)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Replicate API (必需)
REPLICATE_API_TOKEN=your_replicate_token
REPLICATE_MODEL=black-forest-labs/flux-schnell
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **访问应用**
打开 http://localhost:3000

## 📁 项目结构

```
ai-image-generator/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── generate-image/ # 图片生成 API
│   │   ├── credits/       # 积分管理 API
│   │   └── redeem/        # 兑换码 API
│   ├── admin/             # 管理页面
│   ├── login/             # 用户认证页面
│   └── generations/       # 生成历史页面
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 组件
│   └── ImageGenerator.tsx # 主要生成组件
├── lib/                  # 工具库
│   ├── supabase.ts       # Supabase 客户端
│   ├── credits.ts        # 积分管理
│   └── storage.ts        # 文件存储
└── supabase/             # 数据库迁移
    └── migrations/       # SQL 迁移文件
```

## 💾 数据库架构

### 核心表结构

- **`user_credits`** - 用户积分余额
- **`credit_history`** - 积分变动记录
- **`generation_history`** - 图片生成历史
- **`redeem_codes`** - 兑换码管理
- **`profiles`** - 用户配置（管理员标识）

### 存储桶

- **`generated-images`** - 生成图片的永久存储

## 🎯 核心业务流程

### 图片生成流程
1. 用户输入提示词 + 选择风格
2. 系统验证用户积分（≥10积分）
3. 调用 Replicate API 生成图片
4. 图片上传到 Supabase Storage
5. 扣除用户积分（10积分）
6. 记录生成历史

### 积分系统
- 新用户注册获得 30 积分
- 每次生成消耗 10 积分
- 支持兑换码充值
- 完整的积分流水记录

## 🔧 开发命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产
npm run start

# 代码检查
npm run lint
```

## 🚀 部署

项目已配置自动部署到 Vercel：

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

## 📞 联系方式

- **项目仓库**：[GitHub](https://github.com/sit-in/ai-image-generator)
- **问题反馈**：[Issues](https://github.com/sit-in/ai-image-generator/issues)
- **邮箱**：pptsuse@gmail.com

## 📄 许可证

MIT License

---

> 本项目基于 Next.js 14 构建，使用现代化的全栈开发技术，提供完整的商业化解决方案。