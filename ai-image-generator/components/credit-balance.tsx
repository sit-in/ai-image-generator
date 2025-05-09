"use client"

import { useEffect, useState } from "react"
import { HistoryIcon, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CreditBalance() {
  const [credits, setCredits] = useState(100)
  const [history, setHistory] = useState([
    { id: 1, type: "消费", amount: -10, description: "生成图片", date: "2023-05-08 14:30" },
    { id: 2, type: "充值", amount: 100, description: "购买基础套餐", date: "2023-05-07 10:15" },
    { id: 3, type: "消费", amount: -10, description: "生成图片", date: "2023-05-06 18:45" },
  ])

  useEffect(() => {
    // In a real app, this would fetch the user's credit balance from an API
    // setCredits(fetchedCredits)
  }, [])

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
                  {history.map((item) => (
                    <div key={item.id} className="flex justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
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
                          <p className="text-sm text-muted-foreground">{item.date}</p>
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
                          <p className="text-sm text-muted-foreground">{item.date}</p>
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
      <Button className="w-full" variant="outline">
        <PlusCircle className="h-4 w-4 mr-2" />
        充值积分
      </Button>
    </div>
  )
}
