'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <h2 className="mb-4 text-xl font-semibold text-red-800">系统错误</h2>
            <p className="mb-4 text-sm text-red-600">
              {error.message || '发生了一个系统错误'}
            </p>
            <button
              onClick={reset}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              重试
            </button>
          </div>
        </div>
      </body>
    </html>
  );
} 