"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, Users, Database, Search, Download, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface BasicInstance {
  id: string
  user_id: string
  instance_name: string
  status: string
  workflow_name: string | null
  created_at: string
  updated_at: string
  profiles?: {
    email: string
    full_name: string | null
  }
}

interface AuditLog {
  id: string
  instance_id: string
  user_id: string
  admin_user_id: string | null
  operation_type: string
  old_values: Record<string, unknown>
  new_values: Record<string, unknown>
  description: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
  instance?: {
    instance_name: string
  }
  user?: {
    email: string
  }
  admin_user?: {
    email: string
  }
}

interface ActivityLog {
  id: string
  user_id: string
  admin_user_id: string | null
  activity_type: string
  resource_type: string
  resource_id: string | null
  description: string
  metadata: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  created_at: string
  user?: {
    email: string
  }
  admin_user?: {
    email: string
  }
}

interface UserSession {
  id: string
  user_id: string
  session_token: string
  ip_address: string | null
  user_agent: string | null
  last_activity: string
  created_at: string
  expires_at: string | null
  user?: {
    email: string
  }
}

interface AdminInstancesViewItem {
  id: string
  user_id: string
  instance_name: string
  status: string
  workflow_name: string | null
  created_at: string
  updated_at: string
  user_email: string
  user_full_name: string | null
}

export default function AdminActivityMonitor() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [userSessions, setUserSessions] = useState<UserSession[]>([])
  const [basicInstances, setBasicInstances] = useState<BasicInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [dateRange, setDateRange] = useState("7") // days
  const [auditTablesExist, setAuditTablesExist] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchAllData()
  }, [dateRange])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const dateFilter = new Date()
      dateFilter.setDate(dateFilter.getDate() - Number.parseInt(dateRange))

      let auditTablesAvailable = true

      // Try to fetch audit logs
      const { data: auditData, error: auditError } = await supabase
        .from("instance_audit_log")
        .select(`
          *,
          instance:instances(instance_name),
          user:profiles!user_id(email),
          admin_user:profiles!admin_user_id(email)
        `)
        .gte("created_at", dateFilter.toISOString())
        .order("created_at", { ascending: false })
        .limit(100)

      if (auditError) {
        console.log("[v0] Audit tables don't exist yet, using fallback mode")
        auditTablesAvailable = false
        setAuditTablesExist(false)
      } else {
        setAuditLogs(auditData || [])
        setAuditTablesExist(true)
      }

      // Try to fetch activity logs only if audit tables exist
      if (auditTablesAvailable) {
        const { data: activityData, error: activityError } = await supabase
          .from("system_activity_log")
          .select(`
            *,
            user:profiles!user_id(email),
            admin_user:profiles!admin_user_id(email)
          `)
          .gte("created_at", dateFilter.toISOString())
          .order("created_at", { ascending: false })
          .limit(100)

        if (activityError) {
          console.error("[v0] Error fetching activity logs:", activityError)
        } else {
          setActivityLogs(activityData || [])
        }

        // Try to fetch active sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from("user_sessions")
          .select(`
            *,
            user:profiles!user_id(email)
          `)
          .gte("last_activity", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
          .order("last_activity", { ascending: false })

        if (sessionsError) {
          console.error("[v0] Error fetching sessions:", sessionsError)
        } else {
          setUserSessions(sessionsData || [])
        }
      }

      const { data: instancesData, error: instancesError } = await supabase
        .from("admin_instances_view")
        .select("*")
        .gte("created_at", dateFilter.toISOString())
        .order("created_at", { ascending: false })

      if (instancesError) {
        console.error("[v0] Error fetching instances:", instancesError)
      } else {
        const transformedInstances = (instancesData || []).map((item: AdminInstancesViewItem) => ({
          id: item.id,
          user_id: item.user_id,
          instance_name: item.instance_name,
          status: item.status,
          workflow_name: item.workflow_name,
          created_at: item.created_at,
          updated_at: item.updated_at,
          profiles: {
            email: item.user_email,
            full_name: item.user_full_name,
          },
        }))
        setBasicInstances(transformedInstances)
      }
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getOperationBadgeColor = (operation: string) => {
    switch (operation) {
      case "CREATE":
        return "bg-green-100 text-green-800"
      case "UPDATE":
        return "bg-blue-100 text-blue-800"
      case "DELETE":
        return "bg-red-100 text-red-800"
      case "STATUS_CHANGE":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActivityBadgeColor = (activity: string) => {
    switch (activity) {
      case "LOGIN":
        return "bg-green-100 text-green-800"
      case "LOGOUT":
        return "bg-gray-100 text-gray-800"
      case "INSTANCE_CREATE":
        return "bg-blue-100 text-blue-800"
      case "INSTANCE_DELETE":
        return "bg-red-100 text-red-800"
      case "ROLE_CHANGE":
        return "bg-purple-100 text-purple-800"
      case "USER_DELETE":
        return "bg-red-100 text-red-800"
      case "ADMIN_ACTION":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800"
      case "connecting":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-red-100 text-red-800"
      case "disconnected":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.instance?.instance_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterType === "all" || log.operation_type === filterType

    return matchesSearch && matchesFilter
  })

  const filteredActivityLogs = activityLogs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterType === "all" || log.activity_type === filterType

    return matchesSearch && matchesFilter
  })

  const filteredBasicInstances = basicInstances.filter((instance) => {
    const matchesSearch =
      searchTerm === "" ||
      instance.instance_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instance.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterType === "all" || instance.status === filterType

    return matchesSearch && matchesFilter
  })

  const exportLogs = async (type: "audit" | "activity" | "instances") => {
    let data: Record<string, unknown>[] = []

    if (type === "audit") {
      data = filteredAuditLogs
    } else if (type === "activity") {
      data = filteredActivityLogs
    } else if (type === "instances") {
      data = filteredBasicInstances
    }

    if (data.length === 0) {
      alert("Dışa aktarılacak veri bulunamadı")
      return
    }

    const csv = [
      Object.keys(data[0] || {}).join(","),
      ...data.map((row) =>
        Object.values(row)
          .map((val) => (typeof val === "object" ? JSON.stringify(val) : val))
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${type}_logs_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Veriler yükleniyor...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">İşlem Geçmişi ve Aktivite Monitörü</h2>
          <p className="text-gray-600">Tüm kullanıcı işlemlerini ve sistem aktivitelerini izleyin</p>
          {!auditTablesExist && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                Audit tabloları henüz oluşturulmamış. Temel instance bilgileri gösteriliyor.
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Son 1 gün</SelectItem>
              <SelectItem value="7">Son 7 gün</SelectItem>
              <SelectItem value="30">Son 30 gün</SelectItem>
              <SelectItem value="90">Son 90 gün</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Kullanıcı, instance veya açıklama ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm İşlemler</SelectItem>
            {auditTablesExist ? (
              <>
                <SelectItem value="CREATE">Oluşturma</SelectItem>
                <SelectItem value="UPDATE">Güncelleme</SelectItem>
                <SelectItem value="DELETE">Silme</SelectItem>
                <SelectItem value="STATUS_CHANGE">Durum Değişikliği</SelectItem>
                <SelectItem value="LOGIN">Giriş</SelectItem>
                <SelectItem value="LOGOUT">Çıkış</SelectItem>
                <SelectItem value="ADMIN_ACTION">Admin İşlemi</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="open">Aktif</SelectItem>
                <SelectItem value="connecting">Bağlanıyor</SelectItem>
                <SelectItem value="closed">Kapalı</SelectItem>
                <SelectItem value="disconnected">Bağlantı Kesildi</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue={auditTablesExist ? "audit" : "instances"} className="space-y-4">
        <TabsList>
          {auditTablesExist ? (
            <>
              <TabsTrigger value="audit" className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>Instance İşlemleri ({filteredAuditLogs.length})</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Sistem Aktiviteleri ({filteredActivityLogs.length})</span>
              </TabsTrigger>
              <TabsTrigger value="sessions" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Aktif Oturumlar ({userSessions.length})</span>
              </TabsTrigger>
            </>
          ) : (
            <TabsTrigger value="instances" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Instance Listesi ({filteredBasicInstances.length})</span>
            </TabsTrigger>
          )}
        </TabsList>

        {!auditTablesExist && (
          <TabsContent value="instances" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Mevcut Instance'lar</h3>
              <Button onClick={() => exportLogs("instances")} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                CSV İndir
              </Button>
            </div>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {filteredBasicInstances.map((instance) => (
                  <Card key={instance.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusBadgeColor(instance.status)}>{instance.status}</Badge>
                          <span className="text-sm font-medium">{instance.instance_name}</span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(instance.created_at), "dd MMM yyyy HH:mm", { locale: tr })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {instance.workflow_name ? `Workflow: ${instance.workflow_name}` : "Workflow oluşturulmamış"}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Kullanıcı: {instance.profiles?.email || "Bilinmiyor"}</span>
                          <span>
                            Son Güncelleme: {format(new Date(instance.updated_at), "dd MMM yyyy HH:mm", { locale: tr })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {filteredBasicInstances.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Seçilen kriterlere uygun instance bulunamadı</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        )}

        {auditTablesExist && (
          <>
            <TabsContent value="audit" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Instance İşlem Geçmişi</h3>
                <Button onClick={() => exportLogs("audit")} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  CSV İndir
                </Button>
              </div>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {filteredAuditLogs.map((log) => (
                    <Card key={log.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge className={getOperationBadgeColor(log.operation_type)}>{log.operation_type}</Badge>
                            <span className="text-sm font-medium">{log.instance?.instance_name}</span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(log.created_at), "dd MMM yyyy HH:mm", { locale: tr })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{log.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Kullanıcı: {log.user?.email}</span>
                            {log.admin_user && <span>Admin: {log.admin_user.email}</span>}
                            {log.ip_address && <span>IP: {log.ip_address}</span>}
                          </div>
                        </div>
                        {(log.old_values || log.new_values) && (
                          <Button variant="ghost" size="sm">
                            Detaylar
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Sistem Aktivite Geçmişi</h3>
                <Button onClick={() => exportLogs("activity")} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  CSV İndir
                </Button>
              </div>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {filteredActivityLogs.map((log) => (
                    <Card key={log.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge className={getActivityBadgeColor(log.activity_type)}>{log.activity_type}</Badge>
                            <span className="text-sm font-medium">{log.resource_type}</span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(log.created_at), "dd MMM yyyy HH:mm", { locale: tr })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{log.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Kullanıcı: {log.user?.email}</span>
                            {log.admin_user && <span>Admin: {log.admin_user.email}</span>}
                            {log.ip_address && <span>IP: {log.ip_address}</span>}
                          </div>
                        </div>
                        {log.metadata && (
                          <Button variant="ghost" size="sm">
                            Metadata
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              <h3 className="text-lg font-semibold">Aktif Kullanıcı Oturumları</h3>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {userSessions.map((session) => (
                    <Card key={session.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{session.user?.email}</span>
                            <Badge variant="outline">Aktif</Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>
                              Son Aktivite:{" "}
                              {format(new Date(session.last_activity), "dd MMM yyyy HH:mm", { locale: tr })}
                            </span>
                            {session.ip_address && <span>IP: {session.ip_address}</span>}
                          </div>
                          {session.user_agent && (
                            <p className="text-xs text-gray-500 truncate max-w-md">{session.user_agent}</p>
                          )}
                        </div>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                          Oturumu Sonlandır
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
