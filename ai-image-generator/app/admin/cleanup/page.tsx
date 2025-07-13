'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Scan, Trash2, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface InvalidRecord {
  id: string
  created_at: string
  image_url: string
  error: string
}

interface ScanResult {
  total: number
  valid: number
  invalid: number
}

export default function CleanupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [stats, setStats] = useState<{ totalRecords: number } | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [invalidRecords, setInvalidRecords] = useState<InvalidRecord[]>([])

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

      // 检查管理员权限
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (!profile?.is_admin) {
        toast.error('您没有管理员权限')
        router.push('/')
        return
      }

      setIsAdmin(true)
      await fetchStats()
    } catch (error) {
      console.error('检查权限失败:', error)
      toast.error('检查权限失败')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/cleanup-images')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('获取统计信息失败:', error)
    }
  }

  const handleScan = async () => {
    try {
      setScanning(true)
      setScanResult(null)
      setInvalidRecords([])
      
      const response = await fetch('/api/admin/cleanup-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'scan' }),
      })

      const data = await response.json()

      if (data.success) {
        setScanResult(data.summary)
        setInvalidRecords(data.invalidRecords)
        toast.success(`扫描完成！发现 ${data.summary.invalid} 个无效记录`)
      } else {
        toast.error(data.error || '扫描失败')
      }
    } catch (error) {
      console.error('扫描失败:', error)
      toast.error('扫描时发生错误')
    } finally {
      setScanning(false)
    }
  }

  const handleCleanup = async () => {
    if (!scanResult || scanResult.invalid === 0) {
      toast.error('没有需要清理的记录')
      return
    }

    if (!confirm(`确定要删除 ${scanResult.invalid} 个无效记录吗？此操作不可撤销！`)) {
      return
    }

    try {
      setCleaning(true)
      
      const response = await fetch('/api/admin/cleanup-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'cleanup' }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`清理完成！删除了 ${data.summary.deleted} 个无效记录`)
        // 重新获取统计信息
        await fetchStats()
        // 清空扫描结果
        setScanResult(null)
        setInvalidRecords([])
      } else {
        toast.error(data.error || '清理失败')
      }
    } catch (error) {
      console.error('清理失败:', error)
      toast.error('清理时发生错误')
    } finally {
      setCleaning(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">加载中...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/redeem-codes')}
            className="flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
            返回管理面板
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            图片清理工具
          </h1>
        </div>

        <div className="grid gap-6">
          {/* Stats Card */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                系统统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats?.totalRecords || 0}</div>
                  <div className="text-sm text-muted-foreground">总记录数</div>
                </div>
                
                {scanResult && (
                  <>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{scanResult.valid}</div>
                      <div className="text-sm text-muted-foreground">有效记录</div>
                    </div>
                    
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{scanResult.invalid}</div>
                      <div className="text-sm text-muted-foreground">无效记录</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Card */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scan className="h-5 w-5 mr-2 text-purple-600" />
                清理操作
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    onClick={handleScan}
                    disabled={scanning}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    {scanning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        扫描中...
                      </>
                    ) : (
                      <>
                        <Scan className="h-4 w-4 mr-2" />
                        扫描无效图片
                      </>
                    )}
                  </Button>

                  {scanResult && scanResult.invalid > 0 && (
                    <Button
                      onClick={handleCleanup}
                      disabled={cleaning}
                      variant="destructive"
                      className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                    >
                      {cleaning ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          清理中...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          清理无效记录
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>• 扫描操作会检查所有图片链接的有效性</p>
                  <p>• 清理操作会删除无法访问的图片记录</p>
                  <p>• 清理操作不可撤销，请谨慎操作</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invalid Records Table */}
          {invalidRecords.length > 0 && (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  无效记录列表
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>创建时间</TableHead>
                        <TableHead>图片链接</TableHead>
                        <TableHead>错误信息</TableHead>
                        <TableHead>状态</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invalidRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              {new Date(record.created_at).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate text-xs font-mono">
                              {record.image_url}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-red-600">
                              {record.error}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              无效
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}