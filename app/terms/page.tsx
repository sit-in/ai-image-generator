import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '服务条款 - AI 图片生成器',
  description: '使用我们的服务前，请仔细阅读服务条款',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">服务条款</h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <p className="text-gray-600 text-sm">生效日期：2025年1月18日</p>
          
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">1. 服务说明</h2>
            <p className="text-gray-600">
              AI图片生成器（以下简称"本服务"）是一个基于人工智能技术的图片生成平台。通过使用本服务，您同意遵守以下条款。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">2. 用户账户</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>您必须年满13岁才能使用本服务</li>
              <li>您有责任维护账户安全，包括密码保密</li>
              <li>您对账户下的所有活动负责</li>
              <li>禁止创建虚假或多个账户</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">3. 使用规范</h2>
            <p className="text-gray-600 font-semibold">禁止生成以下内容：</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>违法、有害、威胁、辱骂、骚扰、诽谤、色情或令人反感的内容</li>
              <li>侵犯他人知识产权的内容</li>
              <li>包含病毒或恶意代码的内容</li>
              <li>冒充他人或虚假陈述的内容</li>
              <li>未经授权的商业广告或推广</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">4. 积分系统</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>积分用于生成图片，每次生成消耗10积分</li>
              <li>积分一经购买不可退款（法律另有规定除外）</li>
              <li>积分不可转让给其他用户</li>
              <li>我们保留调整积分价格和消耗量的权利</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">5. 知识产权</h2>
            <p className="text-gray-600">
              <strong>用户内容：</strong>您保留对输入内容的所有权利，但授予我们使用这些内容提供服务的许可。
            </p>
            <p className="text-gray-600">
              <strong>生成内容：</strong>您拥有通过本服务生成的图片的使用权，可用于个人或商业用途。
            </p>
            <p className="text-gray-600">
              <strong>平台内容：</strong>本服务的设计、功能、代码等属于我们的知识产权。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">6. 免责声明</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>本服务按"现状"提供，不提供任何明示或暗示的保证</li>
              <li>我们不对服务中断、数据丢失或其他损害负责</li>
              <li>我们不对生成内容的准确性、合法性或适用性负责</li>
              <li>用户应自行判断生成内容的使用是否合法合规</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">7. 服务变更</h2>
            <p className="text-gray-600">
              我们保留随时修改、暂停或终止服务的权利，恕不另行通知。对于服务的任何修改、暂停或终止，我们不承担责任。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">8. 违规处理</h2>
            <p className="text-gray-600">
              如果您违反本条款，我们有权：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>暂停或终止您的账户</li>
              <li>删除违规内容</li>
              <li>拒绝提供服务</li>
              <li>采取法律行动</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">9. 赔偿</h2>
            <p className="text-gray-600">
              您同意赔偿并使我们免受因您使用本服务而产生的任何索赔、损失、责任、损害、费用和开支。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">10. 适用法律</h2>
            <p className="text-gray-600">
              本条款受中华人民共和国法律管辖。任何争议应通过友好协商解决，协商不成的，应提交至我们所在地的人民法院诉讼解决。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">11. 联系方式</h2>
            <p className="text-gray-600">
              如有任何问题，请联系：support@ai-image-generator.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}