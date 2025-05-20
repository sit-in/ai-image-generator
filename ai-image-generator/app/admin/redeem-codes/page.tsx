'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'

type RedeemCode = {
  id: string
  code: string
  type: string
  amount: number
  used: boolean
  used_by: string | null
  used_at: string | null
  expires_at: string | null
  created_at: string
}

export default function RedeemCodesPage() {
  const router = useRouter()
  const [codes, setCodes] = useState<RedeemCode[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [type, setType] = useState('BASIC')
  const [count, setCount] = useState('10')
  const [expiresInDays, setExpiresInDays] = useState('30')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('请先登录')
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (!profile?.is_admin) {
        toast.error('无权限访问')
        router.push('/')
        return
      }

      setIsAdmin(true)
      fetchCodes()
    } catch (error) {
      console.error('检查管理员权限失败:', error)
      toast.error('权限验证失败')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('redeem_codes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setCodes(data || [])
    } catch (error) {
      console.error('获取兑换码失败:', error)
      toast.error('获取兑换码失败')
    } finally {
      setLoading(false)
    }
  }

  const generateCodes = async () => {
    try {
      setGenerating(true)
      const response = await fetch('/api/admin/generate-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          count: parseInt(count),
          expiresInDays: parseInt(expiresInDays),
        }),
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message)
      }

      toast.success('生成兑换码成功')
      fetchCodes()
    } catch (error) {
      console.error('生成兑换码失败:', error)
      toast.error('生成兑换码失败')
    } finally {
      setGenerating(false)
    }
  }

  const exportCodes = () => {
    const unusedCodes = codes.filter(code => !code.used)
    const csv = [
      ['兑换码', '类型', '积分', '过期时间'].join(','),
      ...unusedCodes.map(code => [
        code.code,
        code.type,
        code.amount,
        code.expires_at ? new Date(code.expires_at).toLocaleString() : '永久有效'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `redeem-codes-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'BASIC':
        return '基础套餐 (100积分)'
      case 'STANDARD':
        return '标准套餐 (300积分)'
      case 'PREMIUM':
        return '高级套餐 (1000积分)'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Button>
        <h1 className="text-2xl font-bold">兑换码管理</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>兑换码管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>套餐类型</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASIC">基础套餐 (100积分)</SelectItem>
                    <SelectItem value="STANDARD">标准套餐 (300积分)</SelectItem>
                    <SelectItem value="PREMIUM">高级套餐 (1000积分)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>生成数量</Label>
                <Input
                  type="number"
                  value={count}
                  onChange={e => setCount(e.target.value)}
                  placeholder="请输入生成数量"
                  min="1"
                  max="100"
                />
                <p className="text-sm text-muted-foreground">建议每次生成不超过100个</p>
              </div>

              <div className="space-y-2">
                <Label>有效期（天）</Label>
                <Input
                  type="number"
                  value={expiresInDays}
                  onChange={e => setExpiresInDays(e.target.value)}
                  placeholder="请输入有效期天数"
                  min="1"
                  max="365"
                />
                <p className="text-sm text-muted-foreground">建议设置30-90天</p>
              </div>

              <div className="space-y-2">
                <Label>操作</Label>
                <div className="flex gap-2">
                  <Button onClick={generateCodes} disabled={generating} className="flex-1">
                    {generating ? '生成中...' : '生成兑换码'}
                  </Button>
                  <Button variant="outline" onClick={exportCodes} className="flex-1">
                    导出未使用
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>兑换码</TableHead>
                    <TableHead>套餐类型</TableHead>
                    <TableHead>积分</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>使用时间</TableHead>
                    <TableHead>过期时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codes.map(code => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono">{code.code}</TableCell>
                      <TableCell>{getTypeLabel(code.type)}</TableCell>
                      <TableCell>{code.amount}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          code.used ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {code.used ? '已使用' : '未使用'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {code.used_at ? new Date(code.used_at).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </TableCell>
                      <TableCell>
                        {code.expires_at ? new Date(code.expires_at).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '永久有效'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 