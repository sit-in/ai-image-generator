# 💻 支付系统代码模板集合

> 这个文档包含了支付系统实施所需的完整代码模板，可以直接复制使用。

## 🗄️ 数据库迁移脚本

### 完整的SQL迁移脚本
```sql
-- 文件: supabase/migrations/20240714000000_add_payment_system.sql

-- 支付方式配置表
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'stripe', 'paypal', 'alipay_global'
    is_active BOOLEAN DEFAULT true,
    config JSON NOT NULL, -- 存储各支付方式的配置
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
    package_type VARCHAR(20) NOT NULL, -- 'BASIC', 'STANDARD', 'PREMIUM'
    payment_method VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
    payment_intent_id VARCHAR(255), -- Stripe Payment Intent ID
    paypal_order_id VARCHAR(255), -- PayPal Order ID
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
    type VARCHAR(20) NOT NULL, -- 'BASIC', 'STANDARD', 'PREMIUM'
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

-- 插入默认支付套餐
INSERT INTO payment_packages (name, type, credits, price, currency, sort_order) VALUES
('体验套餐', 'BASIC', 100, 4.99, 'USD', 1),
('标准套餐', 'STANDARD', 500, 19.99, 'USD', 2),
('专业套餐', 'PREMIUM', 1200, 39.99, 'USD', 3),
('企业套餐', 'ENTERPRISE', 3000, 89.99, 'USD', 4);

-- 支付成功处理存储过程
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
  -- 开始事务
  BEGIN
    -- 1. 更新订单状态
    UPDATE payment_orders 
    SET 
      status = 'completed',
      updated_at = NOW()
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
    
    -- 提交事务
    COMMIT;
  EXCEPTION
    WHEN OTHERS THEN
      -- 回滚事务
      ROLLBACK;
      RAISE;
  END;
END;
$$ LANGUAGE plpgsql;
```

## 🔧 核心库文件

### 1. 支付配置管理 (`lib/payment-config.ts`)
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
  alipay: {
    appId: string;
    privateKey: string;
    publicKey: string;
    gatewayUrl: string;
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
    alipay: {
      appId: process.env.ALIPAY_APP_ID!,
      privateKey: process.env.ALIPAY_PRIVATE_KEY!,
      publicKey: process.env.ALIPAY_PUBLIC_KEY!,
      gatewayUrl: process.env.ALIPAY_GATEWAY_URL!,
    },
  };
};
```

### 2. 支付处理器接口 (`lib/payment-processor.ts`)
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

### 3. 支付工厂类 (`lib/payment-factory.ts`)
```typescript
import { PaymentProcessor } from './payment-processor';
import { StripeProcessor } from './processors/stripe-processor';
import { PayPalProcessor } from './processors/paypal-processor';
import { AlipayProcessor } from './processors/alipay-processor';

export class PaymentFactory {
  static createProcessor(method: 'stripe' | 'paypal' | 'alipay_global'): PaymentProcessor {
    switch (method) {
      case 'stripe':
        return new StripeProcessor();
      case 'paypal':
        return new PayPalProcessor();
      case 'alipay_global':
        return new AlipayProcessor();
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  }
}
```

### 4. Stripe处理器 (`lib/processors/stripe-processor.ts`)
```typescript
import Stripe from 'stripe';
import { PaymentProcessor, PaymentOrder, PaymentResult } from '../payment-processor';
import { getPaymentConfig } from '../payment-config';

export class StripeProcessor implements PaymentProcessor {
  private stripe: Stripe;
  private config;

  constructor() {
    this.config = getPaymentConfig().stripe;
    this.stripe = new Stripe(this.config.secretKey);
  }

  async createPaymentIntent(order: PaymentOrder): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(order.amount * 100), // Convert to cents
        currency: order.currency.toLowerCase(),
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          userId: order.userId,
          credits: order.credits.toString(),
          packageType: order.packageType,
        },
        automatic_payment_methods: { enabled: true },
      });

      return {
        success: true,
        orderId: order.id,
        transactionId: paymentIntent.id,
        paymentData: {
          clientSecret: paymentIntent.client_secret,
          publishableKey: this.config.publicKey,
        },
      };
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      return {
        success: false,
        orderId: order.id,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async confirmPayment(orderId: string, paymentData: Record<string, any>): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentData.paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          orderId,
          transactionId: paymentIntent.id,
        };
      } else {
        return {
          success: false,
          orderId,
          errorMessage: `Payment status: ${paymentIntent.status}`,
        };
      }
    } catch (error) {
      console.error('Stripe payment confirmation failed:', error);
      return {
        success: false,
        orderId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async verifyWebhook(payload: string, signature: string): Promise<boolean> {
    try {
      this.stripe.webhooks.constructEvent(payload, signature, this.config.webhookSecret);
      return true;
    } catch (error) {
      console.error('Stripe webhook verification failed:', error);
      return false;
    }
  }

  async processWebhook(payload: Record<string, any>): Promise<PaymentResult> {
    try {
      const event = payload as Stripe.Event;
      
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;
        
        return {
          success: true,
          orderId,
          transactionId: paymentIntent.id,
        };
      }
      
      return {
        success: false,
        orderId: '',
        errorMessage: `Unhandled event type: ${event.type}`,
      };
    } catch (error) {
      console.error('Stripe webhook processing failed:', error);
      return {
        success: false,
        orderId: '',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
```

### 5. 支付服务主类 (`lib/payment-service.ts`)
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
    try {
      // 1. 获取套餐信息
      const { data: packageData, error: packageError } = await this.supabase
        .from('payment_packages')
        .select('*')
        .eq('id', packageId)
        .single();

      if (packageError || !packageData) {
        return {
          success: false,
          orderId: '',
          errorMessage: 'Package not found',
        };
      }

      // 2. 创建订单
      const orderNumber = this.generateOrderNumber();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30分钟后过期

      const { data: orderData, error: orderError } = await this.supabase
        .from('payment_orders')
        .insert({
          user_id: userId,
          order_number: orderNumber,
          amount: packageData.price,
          currency: packageData.currency,
          credits_amount: packageData.credits,
          package_type: packageData.type,
          payment_method: paymentMethod,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (orderError || !orderData) {
        return {
          success: false,
          orderId: '',
          errorMessage: 'Failed to create order',
        };
      }

      // 3. 创建支付意图
      const processor = PaymentFactory.createProcessor(paymentMethod);
      const paymentOrder: PaymentOrder = {
        id: orderData.id,
        orderNumber: orderData.order_number,
        amount: orderData.amount,
        currency: orderData.currency,
        credits: orderData.credits_amount,
        userId,
        packageType: orderData.package_type,
      };

      const result = await processor.createPaymentIntent(paymentOrder);

      // 4. 更新订单状态
      if (result.success) {
        await this.supabase
          .from('payment_orders')
          .update({
            status: 'processing',
            payment_intent_id: result.transactionId,
          })
          .eq('id', orderData.id);
      }

      return {
        ...result,
        orderId: orderData.id,
        paymentData: {
          ...result.paymentData,
          orderNumber,
          amount: orderData.amount,
          currency: orderData.currency,
          credits: orderData.credits_amount,
          expiresAt: expiresAt.toISOString(),
        },
      };
    } catch (error) {
      console.error('Payment order creation failed:', error);
      return {
        success: false,
        orderId: '',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async confirmPayment(
    orderId: string,
    paymentMethod: 'stripe' | 'paypal' | 'alipay_global',
    paymentData: Record<string, any>
  ): Promise<PaymentResult> {
    try {
      // 1. 获取订单信息
      const { data: orderData, error: orderError } = await this.supabase
        .from('payment_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        return {
          success: false,
          orderId,
          errorMessage: 'Order not found',
        };
      }

      // 2. 检查订单状态
      if (orderData.status === 'completed') {
        return {
          success: true,
          orderId,
          transactionId: orderData.payment_intent_id,
        };
      }

      if (orderData.status === 'failed' || orderData.status === 'cancelled') {
        return {
          success: false,
          orderId,
          errorMessage: 'Order already processed',
        };
      }

      // 3. 确认支付
      const processor = PaymentFactory.createProcessor(paymentMethod);
      const result = await processor.confirmPayment(orderId, paymentData);

      // 4. 处理支付结果
      if (result.success) {
        await this.processSuccessfulPayment(orderData, result.transactionId!);
      } else {
        await this.processFailedPayment(orderData, result.errorMessage!);
      }

      return result;
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      return {
        success: false,
        orderId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async processSuccessfulPayment(orderData: any, transactionId: string): Promise<void> {
    // 使用事务确保数据一致性
    const { error } = await this.supabase.rpc('process_successful_payment', {
      p_order_id: orderData.id,
      p_user_id: orderData.user_id,
      p_credits_amount: orderData.credits_amount,
      p_transaction_id: transactionId,
      p_payment_method: orderData.payment_method,
      p_amount: orderData.amount,
      p_currency: orderData.currency,
    });

    if (error) {
      console.error('Failed to process successful payment:', error);
      throw new Error('Payment processing failed');
    }
  }

  private async processFailedPayment(orderData: any, errorMessage: string): Promise<void> {
    await this.supabase
      .from('payment_orders')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderData.id);

    await this.supabase
      .from('payment_records')
      .insert({
        order_id: orderData.id,
        user_id: orderData.user_id,
        payment_method: orderData.payment_method,
        amount: orderData.amount,
        currency: orderData.currency,
        status: 'failed',
        gateway_response: { error: errorMessage },
      });
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORDER-${timestamp}-${random}`;
  }
}
```

## 🌐 API路由模板

### 1. 创建支付订单 (`app/api/payment/create-order/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payment-service';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户身份
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 2. 解析请求数据
    const { packageId, paymentMethod, currency = 'USD' } = await request.json();

    if (!packageId || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. 创建支付订单
    const paymentService = new PaymentService();
    const result = await paymentService.createPaymentOrder(
      user.id,
      packageId,
      paymentMethod
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      orderNumber: result.paymentData?.orderNumber,
      amount: result.paymentData?.amount,
      currency: result.paymentData?.currency,
      credits: result.paymentData?.credits,
      expiresAt: result.paymentData?.expiresAt,
      paymentData: {
        clientSecret: result.paymentData?.clientSecret,
        publishableKey: result.paymentData?.publishableKey,
        paypalOrderId: result.paymentData?.paypalOrderId,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 2. Stripe支付确认 (`app/api/payment/stripe/confirm/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payment-service';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户身份
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 2. 解析请求数据
    const { paymentIntentId, orderId } = await request.json();

    if (!paymentIntentId || !orderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. 验证订单所有权
    const { data: orderData, error: orderError } = await supabase
      .from('payment_orders')
      .select('user_id')
      .eq('id', orderId)
      .single();

    if (orderError || !orderData || orderData.user_id !== user.id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 4. 确认支付
    const paymentService = new PaymentService();
    const result = await paymentService.confirmPayment(
      orderId,
      'stripe',
      { paymentIntentId }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      transactionId: result.transactionId,
    });
  } catch (error) {
    console.error('Stripe confirm error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3. Stripe Webhook处理 (`app/api/payment/webhooks/stripe/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payment-service';
import { StripeProcessor } from '@/lib/processors/stripe-processor';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // 1. 获取请求数据
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // 2. 验证Webhook签名
    const processor = new StripeProcessor();
    const isValid = await processor.verifyWebhook(body, signature);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // 3. 处理Webhook事件
    const event = JSON.parse(body);
    
    // 记录Webhook日志
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase
      .from('payment_webhooks')
      .insert({
        payment_method: 'stripe',
        event_type: event.type,
        event_id: event.id,
        payload: event,
      });

    // 4. 处理支付成功事件
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;

      if (orderId) {
        const paymentService = new PaymentService();
        const result = await paymentService.confirmPayment(
          orderId,
          'stripe',
          { paymentIntentId: paymentIntent.id }
        );

        if (!result.success) {
          console.error('Webhook payment processing failed:', result.errorMessage);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
```

## 🎨 前端组件模板

### 1. 支付套餐选择 (`components/payment/payment-packages.tsx`)
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PaymentPackage {
  id: string;
  name: string;
  type: string;
  credits: number;
  price: number;
  currency: string;
  isActive: boolean;
  sortOrder: number;
}

interface PaymentPackagesProps {
  onSelectPackage: (packageId: string, paymentMethod: string) => void;
}

export default function PaymentPackages({ onSelectPackage }: PaymentPackagesProps) {
  const [packages, setPackages] = useState<PaymentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/payment/packages');
      const data = await response.json();
      
      if (data.success) {
        setPackages(data.packages);
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (packageId: string, paymentMethod: string) => {
    setSelectedPackage(packageId);
    onSelectPackage(packageId, paymentMethod);
  };

  if (loading) {
    return <div className="text-center">加载中...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {packages.map((pkg) => (
        <Card key={pkg.id} className="relative">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">{pkg.name}</CardTitle>
            {pkg.type === 'STANDARD' && (
              <Badge className="absolute top-2 right-2">推荐</Badge>
            )}
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div>
              <div className="text-3xl font-bold text-primary">
                ${pkg.price}
              </div>
              <div className="text-sm text-gray-600">
                {pkg.credits} 积分
              </div>
              <div className="text-xs text-gray-500">
                约 {Math.floor(pkg.credits / 10)} 张图片
              </div>
            </div>
            
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={() => handlePackageSelect(pkg.id, 'stripe')}
                disabled={selectedPackage === pkg.id}
              >
                {selectedPackage === pkg.id ? '处理中...' : 'Stripe支付'}
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handlePackageSelect(pkg.id, 'paypal')}
                disabled={selectedPackage === pkg.id}
              >
                PayPal支付
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### 2. Stripe支付表单 (`components/payment/stripe-payment-form.tsx`)
```typescript
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentFormProps {
  clientSecret: string;
  orderId: string;
  amount: number;
  currency: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

function CheckoutForm({ clientSecret, orderId, amount, currency, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      onError('Card element not found');
      setLoading(false);
      return;
    }

    try {
      // 确认支付
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else if (paymentIntent?.status === 'succeeded') {
        // 通知后端确认支付
        const response = await fetch('/api/payment/stripe/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            orderId,
          }),
        });

        const result = await response.json();

        if (result.success) {
          onSuccess(result);
        } else {
          onError(result.error || 'Payment confirmation failed');
        }
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>信用卡支付</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border rounded-md">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </div>
          
          <div className="text-sm text-gray-600">
            支付金额: ${amount} {currency}
          </div>
          
          <Button
            type="submit"
            disabled={!stripe || loading}
            className="w-full"
          >
            {loading ? '处理中...' : `支付 $${amount}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function StripePaymentForm(props: StripePaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
```

### 3. 支付成功页面 (`components/payment/payment-success.tsx`)
```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, Clock } from 'lucide-react';

interface PaymentSuccessProps {
  orderId: string;
  transactionId: string;
  onContinue: () => void;
}

interface OrderDetails {
  orderNumber: string;
  amount: number;
  currency: string;
  credits: number;
  packageType: string;
  createdAt: string;
}

export default function PaymentSuccess({ orderId, transactionId, onContinue }: PaymentSuccessProps) {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/payment/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setOrderDetails(data.order);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">加载中...</div>;
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-700">
            支付成功！
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {orderDetails && (
            <>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">订单号:</span>
                  <span className="font-mono text-sm">{orderDetails.orderNumber}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">支付金额:</span>
                  <span className="font-semibold">
                    ${orderDetails.amount} {orderDetails.currency}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">获得积分:</span>
                  <Badge variant="secondary">
                    {orderDetails.credits} 积分
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">套餐类型:</span>
                  <span>{orderDetails.packageType}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">交易ID:</span>
                  <span className="font-mono text-xs">{transactionId}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>支付时间: {new Date(orderDetails.createdAt).toLocaleString()}</span>
              </div>
            </>
          )}
          
          <Button
            onClick={onContinue}
            className="w-full"
            size="lg"
          >
            继续使用服务
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            积分已自动充值到您的账户
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 🧪 测试模板

### 1. 支付服务测试 (`tests/payment-service.test.ts`)
```typescript
import { PaymentService } from '../lib/payment-service';

describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService();
  });

  describe('createPaymentOrder', () => {
    it('should create payment order successfully', async () => {
      const result = await paymentService.createPaymentOrder(
        'user-1',
        'package-1',
        'stripe'
      );

      expect(result.success).toBe(true);
      expect(result.orderId).toBeDefined();
      expect(result.paymentData?.clientSecret).toBeDefined();
    });

    it('should handle invalid package', async () => {
      const result = await paymentService.createPaymentOrder(
        'user-1',
        'invalid-package',
        'stripe'
      );

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('Package not found');
    });
  });
});
```

### 2. API测试 (`tests/api/payment.test.ts`)
```typescript
import { createMocks } from 'node-mocks-http';
import handler from '../../app/api/payment/create-order/route';

describe('/api/payment/create-order', () => {
  it('should create payment order', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        packageId: 'package-1',
        paymentMethod: 'stripe',
      },
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
  });
});
```

---

**使用说明**: 这些代码模板可以直接复制到对应的文件中，然后根据具体需求进行调整。建议按照文件结构顺序逐步实现。

*最后更新: 2024-07-14*