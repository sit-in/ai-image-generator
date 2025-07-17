# Next.js 部署常见问题解决指南

## 常见部署错误及解决方案

### 1. useSearchParams() 预渲染错误

**错误信息：**
```
Error: useSearchParams() should be wrapped in a suspense boundary at page "/register"
```

**原因：**
`useSearchParams()` 是一个客户端钩子，在构建时无法获取查询参数。

**解决方案：**
```tsx
// ❌ 错误用法
export default function Page() {
  const searchParams = useSearchParams()
  // ...
}

// ✅ 正确用法
import { Suspense } from 'react'

function PageContent() {
  const searchParams = useSearchParams()
  // ...
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  )
}
```

### 2. 环境变量配置

**客户端环境变量必须以 `NEXT_PUBLIC_` 开头：**
```env
# ✅ 客户端可访问
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# ❌ 仅服务端可访问
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### 3. 动态导入解决方案

对于某些组件，可以使用动态导入避免 SSR 问题：

```tsx
import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(
  () => import('./component'),
  { 
    ssr: false,
    loading: () => <div>Loading...</div>
  }
)
```

### 4. 部署前检查清单

1. **运行生产构建测试：**
   ```bash
   npm run build
   npm run start
   ```

2. **检查所有环境变量：**
   - 确保 `.env.production` 包含所有必需的环境变量
   - 验证客户端变量都有 `NEXT_PUBLIC_` 前缀

3. **检查客户端钩子使用：**
   - `useSearchParams()` 需要 Suspense 包装
   - `useRouter()` 在某些情况下也需要检查
   - 避免在服务端组件中使用客户端钩子

4. **数据库和存储配置：**
   - 确保 Supabase 项目的 URL 和密钥正确
   - 检查 CORS 设置是否允许生产域名

### 5. Vercel 部署特定配置

在 `vercel.json` 中添加：
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

### 6. 调试技巧

1. **本地模拟生产环境：**
   ```bash
   NODE_ENV=production npm run build
   NODE_ENV=production npm run start
   ```

2. **检查构建日志：**
   - Vercel 部署日志
   - 本地构建输出
   - 浏览器控制台错误

3. **使用 Next.js 错误边界：**
   ```tsx
   export default function ErrorBoundary({
     error,
     reset,
   }: {
     error: Error
     reset: () => void
   }) {
     return (
       <div>
         <h2>Something went wrong!</h2>
         <button onClick={reset}>Try again</button>
       </div>
     )
   }
   ```

## 预防措施

1. **定期运行构建测试**
2. **使用 TypeScript 严格模式**
3. **配置 ESLint 规则检查钩子使用**
4. **使用 CI/CD 自动化测试**

## 相关文档

- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Vercel 部署指南](https://vercel.com/docs/frameworks/nextjs)
- [Suspense 和流式渲染](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)