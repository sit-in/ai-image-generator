import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '退款政策 - AI 图片生成器',
  description: '了解我们的退款政策和申请流程',
};

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">退款政策</h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <p className="text-gray-600 text-sm">更新日期：2025年1月18日</p>
          
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">1. 退款原则</h2>
            <p className="text-gray-600">
              我们致力于提供优质的服务。如果您对我们的服务不满意，在符合以下条件的情况下，您可以申请退款。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">2. 可退款情况</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li><strong>技术故障：</strong>因系统故障导致积分扣除但未成功生成图片</li>
              <li><strong>重复扣费：</strong>同一操作被重复扣除积分</li>
              <li><strong>服务中断：</strong>购买积分后24小时内服务完全不可用</li>
              <li><strong>误购：</strong>购买后7天内未使用任何积分</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">3. 不可退款情况</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>已使用的积分</li>
              <li>购买超过7天的未使用积分</li>
              <li>因违反服务条款导致账户被封禁</li>
              <li>对生成结果不满意（AI生成具有不确定性）</li>
              <li>通过非官方渠道购买的积分</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">4. 退款申请流程</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
              <li>发送邮件至 support@ai-image-generator.com</li>
              <li>邮件标题：[退款申请] + 您的用户名</li>
              <li>提供以下信息：
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>注册邮箱</li>
                  <li>订单号或充值记录截图</li>
                  <li>退款原因说明</li>
                  <li>相关问题截图（如有）</li>
                </ul>
              </li>
              <li>我们将在3个工作日内审核并回复</li>
              <li>退款将原路返回，到账时间取决于支付渠道</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">5. 退款时间</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>审核时间：1-3个工作日</li>
              <li>退款处理：审核通过后1-2个工作日</li>
              <li>到账时间：
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>支付宝：即时到账</li>
                  <li>微信：1-3个工作日</li>
                  <li>银行卡：3-7个工作日</li>
                </ul>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">6. 部分退款</h2>
            <p className="text-gray-600">
              在某些情况下，我们可能提供部分退款：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>已使用部分积分的订单</li>
              <li>超过退款期限但有特殊原因的申请</li>
              <li>服务部分可用的情况</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">7. 争议解决</h2>
            <p className="text-gray-600">
              如果您对退款决定有异议：
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
              <li>可以回复邮件说明情况，我们将重新审核</li>
              <li>提供额外的证明材料</li>
              <li>申请人工客服介入</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">8. 注意事项</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>退款后，相应的积分将从账户中扣除</li>
              <li>频繁申请退款可能影响后续服务</li>
              <li>虚假退款申请将导致账户封禁</li>
              <li>建议先尝试少量购买体验服务</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">9. 联系客服</h2>
            <p className="text-gray-600">
              如有疑问，请联系我们：
            </p>
            <p className="text-gray-600 ml-4">
              邮箱：support@ai-image-generator.com<br />
              工作时间：周一至周五 9:00-18:00（法定节假日除外）
            </p>
          </section>

          <section className="space-y-4 bg-pink-50 p-4 rounded-lg">
            <p className="text-gray-700 text-sm">
              <strong>温馨提示：</strong>为避免不必要的损失，建议您在大额充值前先小额体验我们的服务。我们也提供新用户免费试用机会，让您充分了解服务质量。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}