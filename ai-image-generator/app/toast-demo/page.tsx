"use client"

import { Toaster, toast } from 'sonner';

export default function ToastDemoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Toaster position="top-center" richColors />
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => toast.success('Sonner 测试弹窗！')}
      >
        测试 Sonner Toast
      </button>
    </div>
  );
} 