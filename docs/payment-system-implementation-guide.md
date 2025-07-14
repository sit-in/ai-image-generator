# 🚀 AI图像生成服务支付系统完整实施方案

> 本文档提供了完整的支付系统接入方案，特别针对海外市场的需求。
> 
> **生成时间**: 2024-07-14  
> **适用版本**: Next.js 14 + Supabase  
> **状态**: 待实施

## 📊 核心推荐方案

### 🎯 **海外市场支付解决方案**
**推荐采用 Stripe + PayPal 双轨制：**
- **Stripe 作为主要支付方式**（覆盖全球44个国家，支持135种货币）
- **PayPal 作为补充支付方式**（覆盖200个国家，用户基础庞大）
- **保留兑换码系统**作为B2B客户和特殊场景的支付方式

### 💰 **定价策略建议**
基于AI图像生成行业分析，建议采用**混合定价模式**：

| 套餐类型 | 积分数量 | 生成图片数 | 价格（USD） | 单张成本 |
|---------|---------|-----------|------------|----------|
| 体验套餐 | 100积分 | 10张 | $4.99 | $0.50 |
| 标准套餐 | 500积分 | 50张 | $19.99 | $0.40 |
| 专业套餐 | 1200积分 | 120张 | $39.99 | $0.33 |
| 企业套餐 | 3000积分 | 300张 | $89.99 | $0.30 |

## 🏗️ 技术实施路线图

### **阶段一：基础架构搭建（1-2周）**

#### 1. 数据库迁移
```sql
-- 支付方式配置表
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'stripe', 'paypal', 'alipay_global'
    is_active BOOLEAN DEFAULT true,
    config JSON NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 支付订单表
CREATE TABLE payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    credits_amount INTEGER NOT NULL,
    package_type VARCHAR(20) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payment_intent_id VARCHAR(255),
    paypal_order_id VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 支付记录表
CREATE TABLE payment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES payment_orders(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    payment_method VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL,
    gateway_transaction_id VARCHAR(255),
    gateway_response JSON,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 支付套餐配置表
CREATE TABLE payment_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    credits INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 支付Webhook日志表
CREATE TABLE payment_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_method VARCHAR(20) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_id VARCHAR(255),
    payload JSON NOT NULL,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 修改现有表结构
ALTER TABLE credit_history 
ADD COLUMN payment_order_id UUID REFERENCES payment_orders(id);

-- 添加索引
CREATE INDEX idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX idx_payment_orders_status ON payment_orders(status);
CREATE INDEX idx_payment_orders_created_at ON payment_orders(created_at);
CREATE INDEX idx_redeem_codes_expires_at ON redeem_codes(expires_at);
```

#### 2. 环境变量配置
```env
# 添加到 .env.local
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

#### 3. 安装依赖包
```bash
npm install stripe @paypal/checkout-server-sdk
npm install --save-dev @types/stripe
```

### **阶段二：支付功能开发（2-3周）**

#### 1. 创建支付相关文件结构
```
lib/
├── payment-config.ts
├── payment-factory.ts
├── payment-service.ts
├── payment-processor.ts
└── processors/
    ├── stripe-processor.ts
    └── paypal-processor.ts

app/api/payment/
├── packages/route.ts
├── create-order/route.ts
├── orders/
│   ├── route.ts
│   └── [id]/route.ts
├── stripe/
│   └── confirm/route.ts
├── paypal/
│   └── capture/route.ts
└── webhooks/
    ├── stripe/route.ts
    └── paypal/route.ts

components/payment/
├── payment-method-selector.tsx
├── stripe-payment-form.tsx
├── paypal-payment-button.tsx
├── payment-packages.tsx
└── payment-success.tsx
```

#### 2. 核心代码实现

##### 支付配置管理 (`lib/payment-config.ts`)
```typescript
export interface PaymentConfig {
  stripe: {
    publicKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  paypal: {
    clientId: string;
    clientSecret: string;
    environment: 'sandbox' | 'production';
  };
}

export const getPaymentConfig = (): PaymentConfig => {
  return {
    stripe: {
      publicKey: process.env.STRIPE_PUBLISHABLE_KEY!,
      secretKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID!,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    },
  };
};
```

##### 支付处理器接口 (`lib/payment-processor.ts`)
```typescript
export interface PaymentOrder {
  id: string;
  orderNumber: string;
  amount: number;
  currency: string;
  credits: number;
  userId: string;
  packageType: string;
}

export interface PaymentResult {
  success: boolean;
  orderId: string;
  transactionId?: string;
  errorMessage?: string;
  paymentData?: Record<string, any>;
}

export interface PaymentProcessor {
  createPaymentIntent(order: PaymentOrder): Promise<PaymentResult>;
  confirmPayment(orderId: string, paymentData: Record<string, any>): Promise<PaymentResult>;
  verifyWebhook(payload: string, signature: string): Promise<boolean>;
  processWebhook(payload: Record<string, any>): Promise<PaymentResult>;
}
```

##### 支付服务主类 (`lib/payment-service.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';
import { PaymentFactory } from './payment-factory';
import { PaymentOrder, PaymentResult } from './payment-processor';

export class PaymentService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async createPaymentOrder(
    userId: string,
    packageId: string,
    paymentMethod: 'stripe' | 'paypal' | 'alipay_global'
  ): Promise<PaymentResult> {
    // 实现详见完整代码
  }

  async confirmPayment(
    orderId: string,
    paymentMethod: 'stripe' | 'paypal' | 'alipay_global',
    paymentData: Record<string, any>
  ): Promise<PaymentResult> {
    // 实现详见完整代码
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORDER-${timestamp}-${random}`;
  }
}
```

##### 数据库存储过程 (`supabase/functions/process_successful_payment.sql`)
```sql
CREATE OR REPLACE FUNCTION process_successful_payment(
  p_order_id UUID,
  p_user_id UUID,
  p_credits_amount INTEGER,
  p_transaction_id VARCHAR(255),
  p_payment_method VARCHAR(20),
  p_amount DECIMAL(10,2),
  p_currency VARCHAR(3)
) RETURNS VOID AS $$
BEGIN
  -- 使用事务确保数据一致性
  BEGIN
    -- 1. 更新订单状态
    UPDATE payment_orders 
    SET status = 'completed', updated_at = NOW()
    WHERE id = p_order_id;
    
    -- 2. 添加支付记录
    INSERT INTO payment_records (
      order_id, user_id, payment_method, amount, currency, 
      status, gateway_transaction_id
    ) VALUES (
      p_order_id, p_user_id, p_payment_method, p_amount, p_currency,
      'completed', p_transaction_id
    );
    
    -- 3. 更新用户积分
    INSERT INTO user_credits (user_id, credits) 
    VALUES (p_user_id, p_credits_amount)
    ON CONFLICT (user_id) 
    DO UPDATE SET credits = user_credits.credits + p_credits_amount;
    
    -- 4. 记录积分历史
    INSERT INTO credit_history (
      user_id, amount, description, payment_order_id
    ) VALUES (
      p_user_id, p_credits_amount, 
      CONCAT('Payment order ', (SELECT order_number FROM payment_orders WHERE id = p_order_id)),
      p_order_id
    );
    
    COMMIT;
  EXCEPTION
    WHEN OTHERS THEN
      ROLLBACK;
      RAISE;
  END;
END;
$$ LANGUAGE plpgsql;
```

### **阶段三：测试与安全（1-2周）**

#### 1. 测试策略
- **单元测试**: 覆盖率 >= 80%
- **集成测试**: 覆盖主要业务流程
- **端到端测试**: 覆盖完整用户场景
- **性能测试**: 并发支付请求测试
- **安全测试**: 权限验证和数据安全

#### 2. 测试配置
```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts',
  ],
  collectCoverageFrom: [
    'lib/**/*.ts',
    'app/api/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### **阶段四：部署与监控（1周）**

#### 1. 生产环境配置
- 配置生产环境API密钥
- 设置Webhook端点
- 配置域名和SSL证书
- 设置监控和告警

#### 2. 部署检查清单
- [ ] 所有环境变量配置正确
- [ ] 数据库迁移完成
- [ ] Webhook端点验证通过
- [ ] 支付流程测试通过
- [ ] 安全扫描通过
- [ ] 性能测试通过

## 🚀 快速实施指南

### **立即可执行的步骤**

#### 1. 注册支付账户
- [Stripe注册](https://dashboard.stripe.com/register)
- [PayPal开发者账户](https://developer.paypal.com/)

#### 2. 获取API密钥
- **Stripe**: Dashboard → 开发者 → API密钥
- **PayPal**: 创建应用 → 获取Client ID和Secret

#### 3. 设置Webhook端点
- **Stripe**: `https://yourdomain.com/api/payment/webhooks/stripe`
- **PayPal**: `https://yourdomain.com/api/payment/webhooks/paypal`

#### 4. 配置环境变量
```bash
# 复制到你的 .env.local
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

## 🎯 关键决策点说明

### **为什么选择 Stripe + PayPal？**
1. **市场覆盖**: Stripe技术先进，PayPal用户基础广泛
2. **费用优势**: Stripe费率2.9%+$0.30，比PayPal的4.4%+$0.30更低
3. **开发体验**: Stripe API设计优秀，集成简单
4. **风险分散**: 避免单一支付通道的风险

### **定价策略考虑因素**
1. **成本结构**: 每张图片Replicate API成本约$0.05-0.10
2. **市场定位**: 定价略低于Midjourney，更具竞争力
3. **用户心理**: 提供多层次选择，满足不同需求
4. **现金流**: 预付费模式改善现金流

## 🛡️ 安全性保障

### **安全措施**
1. **支付验证**: 双重验证（前端+Webhook）
2. **数据加密**: 所有敏感数据加密存储
3. **访问控制**: 基于角色的权限管理
4. **审计日志**: 完整的操作日志记录

### **风险控制**
1. **支付重试机制**: 自动重试失败的支付
2. **汇率对冲**: 定期调整定价或使用汇率对冲
3. **法律咨询**: 聘请当地法律顾问
4. **灾备方案**: 多支付通道冗余

## 📈 成功指标与优化

### **关键指标**
- **支付成功率**: 目标 > 95%
- **平均订单价值**: 目标 > $25
- **用户留存率**: 目标 > 40%
- **收入增长**: 目标月增长 > 20%

### **持续优化方向**
1. **A/B测试**: 测试不同定价策略
2. **用户体验**: 优化支付流程体验
3. **本地化**: 支持更多本地支付方式
4. **B2B拓展**: 开发企业级支付解决方案

## 🎉 后续行动计划

### **团队分工建议**
1. **后端工程师**: 负责支付API和数据库开发
2. **前端工程师**: 负责支付页面和组件开发
3. **测试工程师**: 负责支付系统测试
4. **产品经理**: 负责定价策略和用户体验优化

### **时间节点**
- **第1周**: 环境搭建和基础架构
- **第2-4周**: 核心功能开发
- **第5周**: 测试和优化
- **第6周**: 部署和上线

### **成功标准**
- 支付成功率 > 95%
- 用户支付体验满意度 > 90%
- 系统稳定性 > 99.9%
- 收入增长 > 50%（相比现有兑换码系统）

## 🔗 相关资源

### **技术文档**
- [Stripe API文档](https://stripe.com/docs/api)
- [PayPal API文档](https://developer.paypal.com/api/rest/)
- [Supabase文档](https://supabase.com/docs)
- [Next.js文档](https://nextjs.org/docs)

### **测试工具**
- [Stripe测试卡号](https://stripe.com/docs/testing)
- [PayPal沙盒环境](https://developer.paypal.com/developer/applications/)

### **监控工具**
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [PayPal Developer Dashboard](https://developer.paypal.com/)
- [Supabase Dashboard](https://app.supabase.com/)

---

**这个完整的支付系统方案将让您的AI图像生成服务具备强大的全球支付能力，显著提升用户体验和商业价值。建议按照上述路线图逐步实施，确保每个阶段都有明确的交付物和质量标准。**

---

*文档版本: 1.0*  
*最后更新: 2024-07-14*  
*维护者: Claude Code*