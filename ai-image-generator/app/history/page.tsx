'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'

export default function HistoryPage() {
  const [user, setUser] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      try {
        const { data, error } = await supabase
          .from('credit_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (error) throw error
        setHistory(data || [])
      } catch (error) {
        console.error('获取积分历史失败:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [router])

  if (loading) {
    return <div className="container mx-auto px-4 py-8">加载中...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>积分消费记录</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="consumption">消费</TabsTrigger>
                <TabsTrigger value="recharge">充值</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <div className="space-y-2">
                  {history.length === 0 && <div className="text-center text-muted-foreground">暂无记录</div>}
                  {history.map((item: any) => (
                    <div key={item.id} className="flex justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                      <p className={item.amount > 0 ? "text-green-600" : "text-red-600"}>
                        {item.amount > 0 ? "+" : ""}{item.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="consumption">
                <div className="space-y-2">
                  {history.filter(item => item.amount < 0).length === 0 && <div className="text-center text-muted-foreground">暂无消费记录</div>}
                  {history.filter(item => item.amount < 0).map((item: any) => (
                    <div key={item.id} className="flex justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-red-600">{item.amount}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="recharge">
                <div className="space-y-2">
                  {history.filter(item => item.amount > 0).length === 0 && <div className="text-center text-muted-foreground">暂无充值记录</div>}
                  {history.filter(item => item.amount > 0).map((item: any) => (
                    <div key={item.id} className="flex justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-green-600">+{item.amount}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 