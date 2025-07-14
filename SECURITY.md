# 安全配置文档

## 已实施的安全措施

### 1. 身份验证和授权
- ✅ **Next.js 中间件保护**: 保护所有需要认证的路由
- ✅ **增强的认证验证**: 多重身份验证检查
- ✅ **会话管理**: 安全的会话创建和验证
- ✅ **管理员权限检查**: 严格的管理员权限验证

### 2. 输入验证和过滤
- ✅ **Zod 架构验证**: 全面的输入验证
- ✅ **内容清理**: DOMPurify 清理用户输入
- ✅ **敏感词过滤**: 防止不当内容生成
- ✅ **SQL 注入防护**: 输入验证和参数化查询

### 3. 速率限制
- ✅ **API 速率限制**: 
  - 图片生成: 每分钟 3 次
  - 一般API: 每分钟 100 次
  - 认证相关: 每5分钟 10 次
  - 兑换码: 每小时 5 次

### 4. CSRF 保护
- ✅ **CSRF Token**: 动态生成和验证
- ✅ **React Context**: 客户端 CSRF 保护
- ✅ **安全头**: 自动添加 CSRF 保护头

### 5. 安全头配置
- ✅ **Content Security Policy (CSP)**: 防止 XSS 攻击
- ✅ **HTTP 安全头**: 
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security`
  - `Referrer-Policy`

### 6. 错误处理和日志
- ✅ **安全事件日志**: 记录可疑活动
- ✅ **错误处理**: 不暴露敏感信息
- ✅ **监控系统**: 实时安全监控

## 使用指南

### 开发环境
```bash
# 运行安全检查
npm run security-check

# 启动开发服务器
npm run dev
```

### 生产环境
```bash
# 构建应用
npm run build

# 启动生产服务器
npm run start
```

## 安全检查清单

### 部署前检查
- [ ] 环境变量已正确配置
- [ ] 安全头已启用
- [ ] HTTPS 已配置
- [ ] 依赖包无已知漏洞
- [ ] 敏感文件未被提交

### 定期检查
- [ ] 依赖包更新
- [ ] 安全审计
- [ ] 日志分析
- [ ] 权限审查

## 配置文件

### 环境变量
```env
# 必需的环境变量
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
REPLICATE_API_TOKEN=your_replicate_token

# 可选的安全配置
CSRF_SECRET=your_csrf_secret
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### 安全配置文件
- `next-security.config.js`: 安全头配置
- `middleware.ts`: 路由保护中间件
- `lib/security.ts`: 安全工具函数

## 最佳实践

### 1. 密钥管理
- 使用环境变量存储敏感信息
- 定期轮换 API 密钥
- 不在代码中硬编码密钥

### 2. 用户输入
- 验证所有用户输入
- 使用白名单而非黑名单
- 对输出进行编码

### 3. 身份验证
- 实施强密码策略
- 使用多因素认证
- 定期检查会话有效性

### 4. 网络安全
- 使用 HTTPS
- 配置适当的 CORS 策略
- 实施内容安全策略

## 应急响应

### 安全事件处理
1. **检测**: 监控日志和报警
2. **响应**: 立即采取保护措施
3. **调查**: 分析事件原因
4. **恢复**: 恢复正常服务
5. **学习**: 更新安全策略

### 联系方式
- 安全团队: security@example.com
- 应急热线: +86-xxx-xxxx-xxxx

## 更新日志

### 2024-01-14
- 实施了全面的安全审计
- 添加了 CSRF 保护
- 增强了输入验证
- 配置了安全头

### 未来计划
- [ ] 实施 WAF (Web Application Firewall)
- [ ] 添加异常检测
- [ ] 集成 SIEM 系统
- [ ] 定期渗透测试

## 参考资料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Supabase Security](https://supabase.com/docs/guides/auth/security)
- [React Security](https://reactjs.org/docs/security.html)