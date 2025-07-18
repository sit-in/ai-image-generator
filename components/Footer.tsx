import Link from 'next/link';
import { BeianInfo } from './BeianInfo';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 产品信息 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">AI 图片生成器</h3>
            <p className="text-sm text-gray-600">
              基于先进AI技术的图片生成平台，让创意变为现实。
            </p>
          </div>
          
          {/* 快速链接 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-purple-600">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/recharge" className="text-gray-600 hover:text-purple-600">
                  充值中心
                </Link>
              </li>
              <li>
                <Link href="/admin/redeem-codes" className="text-gray-600 hover:text-purple-600">
                  兑换码
                </Link>
              </li>
            </ul>
          </div>
          
          {/* 法律信息 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">法律信息</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/agreement" className="text-gray-600 hover:text-purple-600">
                  用户协议
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-purple-600">
                  隐私政策
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-purple-600">
                  服务条款
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-gray-600 hover:text-purple-600">
                  退款政策
                </Link>
              </li>
            </ul>
          </div>
          
          {/* 联系我们 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">联系我们</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>邮箱：support@ai-image-generator.com</li>
              <li>工作时间：周一至周五 9:00-18:00</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-600">
            © {currentYear} AI 图片生成器. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            使用本服务即表示您同意我们的
            <Link href="/terms" className="text-purple-600 hover:underline mx-1">
              服务条款
            </Link>
            和
            <Link href="/privacy" className="text-purple-600 hover:underline mx-1">
              隐私政策
            </Link>
          </p>
        </div>
        
        {/* 备案信息 */}
        <BeianInfo />
      </div>
    </footer>
  );
}