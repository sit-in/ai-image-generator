import Link from 'next/link';

export function BeianInfo() {
  return (
    <div className="text-center py-4 text-xs text-gray-500 border-t border-gray-100">
      <p className="mb-1">
        <Link 
          href="https://beian.miit.gov.cn/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-gray-700"
        >
          {/* 请替换为实际的ICP备案号 */}
          蜀ICP备14006373号-2
        </Link>
      </p>
      {/* 如果有公安备案，请取消下面的注释并填入正确的备案号 */}
      {/* <p>
        <Link 
          href="http://www.beian.gov.cn/portal/registerSystemInfo" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-gray-700 inline-flex items-center gap-1"
        >
          <img 
            src="/beian-icon.png" 
            alt="公安备案图标" 
            className="w-4 h-4 inline-block"
          />
          蜀公网安备 XXXXXXXXXXXXX号
        </Link>
      </p> */}
    </div>
  );
}