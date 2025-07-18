import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '用户协议 - AI 图片生成器',
  description: '使用本服务即表示您同意我们的用户协议',
};

export default function UserAgreement() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">用户协议</h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <p className="text-gray-600 text-sm">生效日期：2025年1月18日</p>
          
          <section className="space-y-4 bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-700">
              欢迎使用AI图片生成器！请您仔细阅读以下协议。使用本服务即表示您已阅读、理解并同意受本协议约束。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">第一条 协议的接受</h2>
            <p className="text-gray-600">
              1.1 本协议是您与AI图片生成器之间关于使用本服务的法律协议。
            </p>
            <p className="text-gray-600">
              1.2 如果您不同意本协议的任何内容，请不要使用本服务。
            </p>
            <p className="text-gray-600">
              1.3 我们保留随时更新本协议的权利，更新后的协议将在网站上公布。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">第二条 服务内容</h2>
            <p className="text-gray-600">
              2.1 本服务提供基于AI技术的图片生成功能。
            </p>
            <p className="text-gray-600">
              2.2 服务内容包括但不限于：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>文字描述转图片生成</li>
              <li>多种艺术风格选择</li>
              <li>图片下载和保存</li>
              <li>生成历史记录</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">第三条 用户资格</h2>
            <p className="text-gray-600">
              3.1 用户必须年满13周岁，未满18周岁的用户须在监护人同意下使用。
            </p>
            <p className="text-gray-600">
              3.2 用户应提供真实、准确的注册信息。
            </p>
            <p className="text-gray-600">
              3.3 一个用户只能注册一个账户，禁止注册多个账户。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">第四条 用户行为规范</h2>
            <p className="text-gray-600">
              4.1 用户不得利用本服务从事以下行为：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>生成违反法律法规的内容</li>
              <li>生成侵犯他人权益的内容</li>
              <li>生成色情、暴力、恐怖等不良内容</li>
              <li>进行商业诈骗或虚假宣传</li>
              <li>攻击、破坏服务器或其他恶意行为</li>
              <li>使用自动化程序或脚本访问服务</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">第五条 知识产权</h2>
            <p className="text-gray-600">
              5.1 用户通过本服务生成的图片，其使用权归用户所有。
            </p>
            <p className="text-gray-600">
              5.2 用户应确保输入的文字描述不侵犯他人知识产权。
            </p>
            <p className="text-gray-600">
              5.3 本服务的程序、界面、商标等知识产权归我们所有。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">第六条 付费服务</h2>
            <p className="text-gray-600">
              6.1 积分是使用本服务的虚拟货币，需通过充值获得。
            </p>
            <p className="text-gray-600">
              6.2 积分价格和优惠活动可能随时调整。
            </p>
            <p className="text-gray-600">
              6.3 已购买的积分不可转让、不可兑现。
            </p>
            <p className="text-gray-600">
              6.4 退款政策请参见《退款政策》。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">第七条 隐私保护</h2>
            <p className="text-gray-600">
              7.1 我们重视用户隐私，详见《隐私政策》。
            </p>
            <p className="text-gray-600">
              7.2 我们不会未经授权向第三方披露用户信息。
            </p>
            <p className="text-gray-600">
              7.3 法律要求或用户同意的情况除外。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">第八条 免责条款</h2>
            <p className="text-gray-600">
              8.1 我们不对以下情况承担责任：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>因不可抗力导致的服务中断</li>
              <li>因用户原因导致的损失</li>
              <li>第三方原因造成的问题</li>
              <li>AI生成内容的准确性和适用性</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">第九条 协议终止</h2>
            <p className="text-gray-600">
              9.1 用户可随时停止使用本服务。
            </p>
            <p className="text-gray-600">
              9.2 违反本协议的用户，我们有权终止服务。
            </p>
            <p className="text-gray-600">
              9.3 协议终止后，已购买的积分不予退还。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">第十条 其他条款</h2>
            <p className="text-gray-600">
              10.1 本协议的解释权归我们所有。
            </p>
            <p className="text-gray-600">
              10.2 本协议受中华人民共和国法律管辖。
            </p>
            <p className="text-gray-600">
              10.3 如有争议，应友好协商解决，协商不成可向我们所在地法院起诉。
            </p>
          </section>

          <section className="space-y-4 bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800">特别提醒</h3>
            <p className="text-gray-700">
              请您特别注意，AI生成的图片具有随机性和不确定性，我们无法保证每次生成的结果都符合您的期望。建议您：
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
              <li>提供详细准确的描述</li>
              <li>选择合适的艺术风格</li>
              <li>理性对待生成结果</li>
              <li>合理使用积分资源</li>
            </ul>
          </section>

          <section className="space-y-4">
            <p className="text-gray-600 text-center font-semibold">
              感谢您选择AI图片生成器！
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}