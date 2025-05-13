# AI 图片生成器

一个基于 AI 技术的图片生成工具，支持文本生成图片，并包含积分系统。

## 功能特点

- 🎨 AI 图片生成：使用先进的 AI 模型生成高质量图片
- 💰 积分系统：支持积分充值和消费
- 📊 积分记录：查看积分变动历史
- 💳 充值套餐：多种充值选项，满足不同需求
- 📱 响应式设计：支持各种设备访问

## 技术栈

- **前端框架**：Next.js 14
- **UI 组件**：shadcn/ui
- **样式**：Tailwind CSS
- **数据库**：Supabase
- **部署**：Vercel

## 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm 或 pnpm 包管理器

### 安装步骤

1. 克隆项目
```bash
git clone [项目地址]
cd ai-image-generator
```

2. 安装依赖
```bash
npm install
# 或
pnpm install
```

3. 配置环境变量
创建 `.env.local` 文件并添加以下配置：
```env
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

4. 启动开发服务器
```bash
npm run dev
# 或
pnpm dev
```

5. 访问项目
打开浏览器访问 `http://localhost:3000`

## 项目结构

```
ai-image-generator/
├── app/                # Next.js 应用目录
│   ├── api/           # API 路由
│   └── page.tsx       # 主页面
├── components/        # React 组件
├── lib/              # 工具函数和配置
├── public/           # 静态资源
└── styles/           # 全局样式
```

## 主要功能说明

### 图片生成
- 支持文本描述生成图片
- 可自定义图片参数
- 支持图片下载

### 积分系统
- 积分余额显示
- 积分充值功能
- 积分历史记录
- 自动扣除积分

## 部署

项目使用 Vercel 进行部署：

1. 在 Vercel 上创建新项目
2. 连接 GitHub 仓库
3. 配置环境变量
4. 部署项目

## 数据库结构

### user_credits 表
- id: UUID (主键)
- user_id: TEXT (唯一)
- credits: INTEGER
- created_at: TIMESTAMP

### credit_history 表
- id: UUID (主键)
- user_id: TEXT
- amount: INTEGER
- description: TEXT
- created_at: TIMESTAMP

## 开发指南

### 添加新功能
1. 创建功能分支
2. 开发新功能
3. 提交代码
4. 创建 Pull Request

### 代码规范
- 使用 TypeScript
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件至：[您的邮箱]
- 微信：257735

## 致谢

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/) 