"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Users,
  Server,
  Settings,
  Search,
  UserPlus,
  Mail,
  Trash2,
  Edit,
  Shield,
  AlertTriangle,
  Globe,
} from "lucide-react"
import AdminActivityMonitor from "./admin-activity-monitor"
import { getTranslation, languages } from "@/lib/i18n"

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

interface Instance {
  id: string
  user_id: string
  instance_name: string
  instance_key: string
  status: string
  workflow_id: string | null
  workflow_name: string | null
  created_at: string
  user_email: string
  user_full_name: string | null
  user_role: string
}

interface AdminDashboardProps {
  users: Profile[]
  instances: Instance[]
  currentUser: any
}

export function AdminDashboard({ users, instances, currentUser }: AdminDashboardProps) {
  const [language, setLanguage] = useState("tr")
  const t = getTranslation(language)

  const [selectedUsers, setSelectedUsers] = useState<Profile[]>(users)
  const [selectedInstances, setSelectedInstances] = useState<Instance[]>(instances)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [newUser, setNewUser] = useState({ email: "", fullName: "", role: "user", password: "" })

  const handleRoleChange = async (userId: string, newRole: string) => {
    setSelectedUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
    alert(t.userUpdated)
  }

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    const userInstances = selectedInstances.filter((instance) => instance.user_id === userId)
    const confirmMessage =
      userInstances.length > 0
        ? `${userEmail} kullanıcısını ve ${userInstances.length} adet instance'ını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
        : `${userEmail} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`

    if (confirm(confirmMessage)) {
      setSelectedUsers((prev) => prev.filter((user) => user.id !== userId))
      setSelectedInstances((prev) => prev.filter((instance) => instance.user_id !== userId))
      alert("Kullanıcı başarıyla silindi!")
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
      alert("Email ve şifre alanları zorunludur")
      return
    }

    const newProfile: Profile = {
      id: Date.now().toString(), // Mock ID
      email: newUser.email,
      full_name: newUser.fullName || null,
      role: newUser.role,
      created_at: new Date().toISOString(),
    }

    setSelectedUsers((prev) => [newProfile, ...prev])
    setNewUser({ email: "", fullName: "", role: "user", password: "" })
    setIsCreateUserOpen(false)
    alert(t.userCreated)
  }

  const handleEditUser = async () => {
    if (!editingUser) return

    setSelectedUsers((prev) => prev.map((user) => (user.id === editingUser.id ? editingUser : user)))

    setIsEditUserOpen(false)
    setEditingUser(null)
    alert(t.userUpdated)
  }

  const handleDeleteInstance = async (instanceId: string, instanceName: string) => {
    if (confirm(`"${instanceName}" instance'ını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      setSelectedInstances((prev) => prev.filter((instance) => instance.id !== instanceId))
      alert("Instance başarıyla silindi!")
    }
  }

  const handleForceLogoutUser = async (userId: string, userEmail: string) => {
    if (confirm(`${userEmail} ${t.confirmForceLogout}`)) {
      alert(t.userLoggedOut)
    }
  }

  const handleSuspendUser = async (userId: string, userEmail: string) => {
    if (confirm(`${userEmail} ${t.confirmSuspend}`)) {
      setSelectedUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: "suspended" } : user)))
      alert(t.userSuspended)
    }
  }

  const handleForceDisconnectInstance = async (instanceId: string, instanceName: string) => {
    if (confirm(`${instanceName} ${t.confirmForceDisconnect}`)) {
      setSelectedInstances((prev) =>
        prev.map((instance) => (instance.id === instanceId ? { ...instance, status: "disconnected" } : instance)),
      )
      alert(t.instanceDisconnected)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      open: "bg-green-500",
      connecting: "bg-yellow-500",
      closed: "bg-red-500",
      disconnected: "bg-gray-500",
    }

    return <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white`}>{status}</Badge>
  }

  const getRoleBadge = (role: string) => {
    const roleColors = {
      admin: "destructive",
      user: "secondary",
      suspended: "outline",
    }
    return <Badge variant={roleColors[role as keyof typeof roleColors] || "secondary"}>{role}</Badge>
  }

  const filteredUsers = selectedUsers.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const filteredInstances = selectedInstances.filter(
    (instance) =>
      instance.instance_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (instance.user_email && instance.user_email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t.adminDashboard}</h1>
                <p className="text-sm text-gray-500">{t.adminDashboardDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32">
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">
                {t.welcome}, {currentUser.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalUsers}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">{users.filter((u) => u.role === "admin").length} admin</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalInstances}</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{instances.length}</div>
              <p className="text-xs text-muted-foreground">
                {instances.filter((i) => i.status === "open").length} aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.activeConnections}</CardTitle>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{instances.filter((i) => i.status === "open").length}</div>
              <p className="text-xs text-muted-foreground">{t.connectedInstances}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{t.newUsers}</CardTitle>
                  <CardDescription>{t.lastWeek}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  users.filter((u) => {
                    const createdDate = new Date(u.created_at)
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return createdDate > weekAgo
                  }).length
                }
              </div>
              <p className="text-xs text-muted-foreground">{t.lastWeek}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">{t.userManagement}</TabsTrigger>
            <TabsTrigger value="instances">{t.instanceManagement}</TabsTrigger>
            <TabsTrigger value="activity">{t.activityHistory}</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{t.userManagement}</CardTitle>
                    <CardDescription>{t.userManagementDesc}</CardDescription>
                  </div>
                  <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        {t.createNewUser}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t.createNewUser}</DialogTitle>
                        <DialogDescription>Sisteme yeni bir kullanıcı ekleyin</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            {t.email}
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                            className="col-span-3"
                            placeholder="kullanici@example.com"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="password" className="text-right">
                            {t.password}
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                            className="col-span-3"
                            placeholder={t.strongPassword}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="fullName" className="text-right">
                            {t.fullName}
                          </Label>
                          <Input
                            id="fullName"
                            value={newUser.fullName}
                            onChange={(e) => setNewUser((prev) => ({ ...prev, fullName: e.target.value }))}
                            className="col-span-3"
                            placeholder={t.optional}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="role" className="text-right">
                            {t.role}
                          </Label>
                          <Select
                            value={newUser.role}
                            onValueChange={(value) => setNewUser((prev) => ({ ...prev, role: value }))}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">{t.regularUser}</SelectItem>
                              <SelectItem value="admin">{t.adminUser}</SelectItem>
                              <SelectItem value="suspended">{t.suspendedUser}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={handleCreateUser}>
                          {t.create}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.email}</TableHead>
                      <TableHead>{t.fullName}</TableHead>
                      <TableHead>{t.role}</TableHead>
                      <TableHead>{t.registrationDate}</TableHead>
                      <TableHead>{t.instanceCount}</TableHead>
                      <TableHead>{t.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const userInstanceCount = selectedInstances.filter((i) => i.user_id === user.id).length
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell>{user.full_name || "Belirtilmemiş"}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString("tr-TR")}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{userInstanceCount}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">{t.regularUser}</SelectItem>
                                  <SelectItem value="admin">{t.adminUser}</SelectItem>
                                  <SelectItem value="suspended">{t.suspendedUser}</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingUser(user)
                                  setIsEditUserOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {user.id !== currentUser.id && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleForceLogoutUser(user.id, user.email)}
                                    title="Tüm oturumları sonlandır"
                                  >
                                    <Shield className="h-4 w-4" />
                                  </Button>
                                  {user.role !== "suspended" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleSuspendUser(user.id, user.email)}
                                      title="Kullanıcıyı askıya al"
                                    >
                                      <AlertTriangle className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instances" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.instanceManagement}</CardTitle>
                <CardDescription>{t.instanceManagementDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.instanceName}</TableHead>
                      <TableHead>{t.instanceOwner}</TableHead>
                      <TableHead>{t.status}</TableHead>
                      <TableHead>{t.workflowName}</TableHead>
                      <TableHead>{t.createdAt}</TableHead>
                      <TableHead>{t.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstances.map((instance) => (
                      <TableRow key={instance.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-gray-400" />
                            {instance.instance_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {instance.user_email || "Bilinmiyor"}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(instance.status)}</TableCell>
                        <TableCell>
                          {instance.workflow_name ? (
                            <Badge variant="outline">{instance.workflow_name}</Badge>
                          ) : (
                            <span className="text-gray-400">Oluşturulmamış</span>
                          )}
                        </TableCell>
                        <TableCell>{new Date(instance.created_at).toLocaleDateString("tr-TR")}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {instance.status === "open" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleForceDisconnectInstance(instance.id, instance.instance_name)}
                                title="Bağlantıyı zorla kes"
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteInstance(instance.id, instance.instance_name)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {t.delete}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <AdminActivityMonitor />
          </TabsContent>
        </Tabs>

        {/* Edit User Dialog */}
        <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.editUser}</DialogTitle>
              <DialogDescription>{t.editUserDesc}</DialogDescription>
            </DialogHeader>
            {editingUser && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">
                    {t.email}
                  </Label>
                  <Input id="edit-email" value={editingUser.email} disabled className="col-span-3 bg-gray-100" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-fullName" className="text-right">
                    {t.fullName}
                  </Label>
                  <Input
                    id="edit-fullName"
                    value={editingUser.full_name || ""}
                    onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, full_name: e.target.value } : null))}
                    className="col-span-3"
                    placeholder="Ad Soyad"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-role" className="text-right">
                    {t.role}
                  </Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value) => setEditingUser((prev) => (prev ? { ...prev, role: value } : null))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">{t.regularUser}</SelectItem>
                      <SelectItem value="admin">{t.adminUser}</SelectItem>
                      <SelectItem value="suspended">{t.suspendedUser}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="submit" onClick={handleEditUser}>
                {t.save}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
