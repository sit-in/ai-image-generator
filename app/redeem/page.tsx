"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function RedeemPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        // 检查 session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('获取 session 失败:', sessionError);
          toast.error('获取 session 失败');
          router.replace('/login');
          return;
        }

        if (!session) {
          // 尝试刷新 session
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError || !refreshedSession) {
            console.error('刷新 session 失败:', refreshError);
            toast.error('请重新登录');
            router.replace('/login');
            return;
          }
        }

        // 监听认证状态变化
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_OUT') {
            toast.error("请先登录");
            router.replace("/login");
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('认证检查失败:', err);
        toast.error('认证检查失败');
        router.replace('/login');
      }
    };
    
    checkAuth();
    return () => { mounted = false; };
  }, [router]);

  const handleRedeem = async () => {
    if (!code) return toast.error("请输入兑换码");
    setLoading(true);
    try {
      // 获取当前 session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('请先登录');
        router.replace('/login');
        return;
      }

      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("充值成功，即将跳转首页");
        setCode("");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        toast.error(data.message || "兑换失败");
      }
    } catch (error) {
      console.error('兑换失败:', error);
      toast.error('兑换失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>兑换码充值</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="请输入兑换码"
            value={code}
            onChange={e => setCode(e.target.value)}
            disabled={loading}
          />
          <Button onClick={handleRedeem} disabled={loading} className="w-full">
            {loading ? "兑换中..." : "立即兑换"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 