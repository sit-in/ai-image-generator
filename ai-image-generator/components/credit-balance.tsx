"use client"

import { useEffect, useState } from "react"
import { HistoryIcon, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"

export default function CreditBalance() {
  const [userId, setUserId] = useState<string | null>(null)
  const [credits, setCredits] = useState(0)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 只在客户端获取 userId
  useEffect(() => {
    const id = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
    setUserId(id)
  }, [])

  // 获取积分余额
  const fetchCredits = async (uid: string) => {
    try {
      const response = await fetch(`/api/credits?userId=${uid}`)
      const data = await response.json()
      setCredits(data.credits)
    } catch (error) {
      console.error('获取积分失败:', error)
    }
  }

  // 获取积分历史
  const fetchHistory = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('credit_history')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
      if (error) throw error
      setHistory(data || [])
    } catch (error) {
      console.error('获取历史记录失败:', error)
    }
  }

  useEffect(() => {
    if (!userId) return
    fetchCredits(userId)
    fetchHistory(userId)
  }, [userId])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">积分余额</h3>
          <p className="text-2xl font-bold">{credits}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <HistoryIcon className="h-4 w-4 mr-2" />
              记录
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>积分记录</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="consumption">消费</TabsTrigger>
                <TabsTrigger value="recharge">充值</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="max-h-[400px] overflow-y-auto">
                <div className="space-y-2 mt-2">
                  {history.map((item: any) => (
                    <div key={item.id} className="flex justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                      <p className={item.amount > 0 ? "text-green-600" : "text-red-600"}>
                        {item.amount > 0 ? "+" : ""}
                        {item.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="consumption" className="max-h-[400px] overflow-y-auto">
                <div className="space-y-2 mt-2">
                  {history
                    .filter((item) => item.amount < 0)
                    .map((item) => (
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
              <TabsContent value="recharge" className="max-h-[400px] overflow-y-auto">
                <div className="space-y-2 mt-2">
                  {history
                    .filter((item) => item.amount > 0)
                    .map((item) => (
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
          </DialogContent>
        </Dialog>
      </div>
      <Button 
        className="w-full" 
        variant="outline"
        onClick={() => window.location.href = '/recharge'}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        充值积分
      </Button>
      <Button 
        className="w-full" 
        variant="outline"
        onClick={() => window.location.href = '/redeem'}
      >
        使用兑换码充值
      </Button>
    </div>
  )
}
