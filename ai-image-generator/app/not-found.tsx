import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">页面未找到</h2>
        <p className="mb-4 text-sm text-gray-600">
          抱歉，您访问的页面不存在
        </p>
        <Link
          href="/"
          className="inline-block rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
} 