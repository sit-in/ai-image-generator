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
    <div className="space-y-6">
      {/* Credit Balance Display */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-purple-100">我的积分</h3>
              <div className="flex items-baseline space-x-2">
                <p className="text-4xl font-bold">{credits}</p>
                <span className="text-purple-200 text-sm">积分</span>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                >
                  <HistoryIcon className="h-4 w-4 mr-2" />
                  记录
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <HistoryIcon className="h-4 w-4 text-white" />
                    </div>
                    积分记录
                  </DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="all">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
                    <TabsTrigger value="all" className="text-xs">全部</TabsTrigger>
                    <TabsTrigger value="consumption" className="text-xs">消费</TabsTrigger>
                    <TabsTrigger value="recharge" className="text-xs">充值</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="max-h-[350px] overflow-y-auto">
                    <div className="space-y-3 mt-4">
                      {history.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <HistoryIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>暂无记录</p>
                        </div>
                      ) : (
                        history.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className={`font-bold text-sm px-2 py-1 rounded-full ${
                              item.amount > 0 
                                ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/20" 
                                : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/20"
                            }`}>
                              {item.amount > 0 ? "+" : ""}{item.amount}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="consumption" className="max-h-[350px] overflow-y-auto">
                    <div className="space-y-3 mt-4">
                      {history.filter((item) => item.amount < 0).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>暂无消费记录</p>
                        </div>
                      ) : (
                        history
                          .filter((item) => item.amount < 0)
                          .map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(item.created_at).toLocaleString()}
                                </p>
                              </div>
                              <div className="font-bold text-sm text-red-700 dark:text-red-400 px-2 py-1 bg-red-100 dark:bg-red-900/20 rounded-full">
                                {item.amount}
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="recharge" className="max-h-[350px] overflow-y-auto">
                    <div className="space-y-3 mt-4">
                      {history.filter((item) => item.amount > 0).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>暂无充值记录</p>
                        </div>
                      ) : (
                        history
                          .filter((item) => item.amount > 0)
                          .map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(item.created_at).toLocaleString()}
                                </p>
                              </div>
                              <div className="font-bold text-sm text-green-700 dark:text-green-400 px-2 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
                                +{item.amount}
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="text-xs text-purple-200 space-y-1">
            <p>• 每张图片消耗 10 积分</p>
            <p>• 可生成约 {Math.floor(credits / 10)} 张图片</p>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Quick Recharge Button */}
      <Button 
        className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
        onClick={() => window.location.href = '/recharge'}
      >
        <PlusCircle className="h-5 w-5 mr-2" />
        立即充值积分
      </Button>
    </div>
  )
}
