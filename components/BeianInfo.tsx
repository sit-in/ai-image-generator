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
          京ICP备2024000001号-1
        </Link>
      </p>
      <p>
        <Link 
          href="http://www.beian.gov.cn/portal/registerSystemInfo" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-gray-700 inline-flex items-center gap-1"
        >
          {/* 请下载公安备案图标后取消注释 */}
          {/* <img 
            src="/beian-icon.png" 
            alt="公安备案图标" 
            className="w-4 h-4 inline-block"
          /> */}
          {/* 请替换为实际的公安备案号 */}
          京公网安备 11010802000001号
        </Link>
      </p>
    </div>
  );
}