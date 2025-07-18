import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '隐私政策 - AI 图片生成器',
  description: '了解我们如何收集、使用和保护您的个人信息',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">隐私政策</h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <p className="text-gray-600 text-sm">更新日期：2025年1月18日</p>
          
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">1. 信息收集</h2>
            <p className="text-gray-600">
              我们收集以下类型的信息：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>账户信息：邮箱地址、用户名</li>
              <li>使用信息：生成的图片内容、使用频率</li>
              <li>技术信息：IP地址、浏览器类型、设备信息</li>
              <li>支付信息：充值记录（支付处理由第三方完成）</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">2. 信息使用</h2>
            <p className="text-gray-600">
              我们使用收集的信息用于：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>提供和改进服务</li>
              <li>处理交易和发送相关通知</li>
              <li>防止欺诈和滥用</li>
              <li>遵守法律义务</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">3. 信息共享</h2>
            <p className="text-gray-600">
              我们不会出售、交易或以其他方式向第三方转让您的个人信息，除非：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>获得您的明确同意</li>
              <li>为提供服务所必需（如支付处理）</li>
              <li>法律要求</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">4. 数据安全</h2>
            <p className="text-gray-600">
              我们采取适当的技术和组织措施来保护您的个人信息，包括：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>SSL加密传输</li>
              <li>安全的数据存储</li>
              <li>定期安全审计</li>
              <li>访问权限控制</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">5. Cookie使用</h2>
            <p className="text-gray-600">
              我们使用Cookie和类似技术来：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>保持登录状态</li>
              <li>记住您的偏好设置</li>
              <li>分析服务使用情况</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">6. 用户权利</h2>
            <p className="text-gray-600">
              您有权：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>访问您的个人数据</li>
              <li>更正不准确的数据</li>
              <li>删除您的账户和相关数据</li>
              <li>反对或限制数据处理</li>
              <li>数据可携带性</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">7. 儿童隐私</h2>
            <p className="text-gray-600">
              我们的服务不面向13岁以下的儿童。如果我们发现收集了13岁以下儿童的个人信息，我们将立即删除这些信息。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">8. 隐私政策更新</h2>
            <p className="text-gray-600">
              我们可能会不时更新本隐私政策。更新后的政策将在本页面发布，并在生效前通过邮件通知您。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">9. 联系我们</h2>
            <p className="text-gray-600">
              如果您对本隐私政策有任何疑问，请通过以下方式联系我们：
            </p>
            <p className="text-gray-600 ml-4">
              邮箱：support@ai-image-generator.com<br />
              地址：[您的公司地址]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}