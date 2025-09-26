"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut, Plus, MessageSquare, Settings } from "lucide-react"
import { PackageManagement } from "./package-management"
import { InstanceLimitWarning } from "./instance-limit-warning"
import { debugLog } from "@/lib/debug"

interface Instance {
  id: string
  instance_name: string
  instance_key: string
  status: string
  workflow_id: string | null
  workflow_name: string | null
  created_at: string
}

interface PackageInfo {
  user_id: string
  package_name: string
  display_name_tr: string
  display_name_en: string
  max_instances: number
  current_instances: number
  remaining_instances: number
  subscription_status: string
}

interface UserDashboardProps {
  user: any
  profile: any
  instances: Instance[]
}

export function UserDashboard({ user, profile, instances }: UserDashboardProps) {
  const [userInstances, setUserInstances] = useState<Instance[]>(instances)
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchPackageInfo()
  }, [])

  const fetchPackageInfo = async () => {
    try {
      const response = await fetch("/api/user/package-info")
      const data = await response.json()

      if (response.ok) {
        setPackageInfo(data.packageInfo)
      }
    } catch (error) {
      debugLog("Failed to fetch package info:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleCreateInstance = () => {
    if (packageInfo && packageInfo.remaining_instances <= 0) {
      // Show upgrade dialog or warning
      return
    }
    router.push("/instances")
  }

  const handleDeleteInstance = async (instanceId: string) => {
    if (confirm("Are you sure you want to delete this instance?")) {
      const { error } = await supabase.from("instances").delete().eq("id", instanceId)

      if (!error) {
        setUserInstances((prev) => prev.filter((instance) => instance.id !== instanceId))
        fetchPackageInfo()
      }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your WhatsApp bot instances</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {profile?.full_name || user.email}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {packageInfo && (
          <InstanceLimitWarning
            currentInstances={packageInfo.current_instances}
            maxInstances={packageInfo.max_instances}
            packageName={packageInfo.package_name}
            packageDisplayTr={packageInfo.display_name_tr}
            packageDisplayEn={packageInfo.display_name_en}
            language="en"
            onUpgradeClick={() => {
              // Could open upgrade dialog here
            }}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats and Package Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Instances</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userInstances.length}</div>
                  <p className="text-xs text-muted-foreground">Total WhatsApp bots</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userInstances.filter((i) => i.status === "open").length}</div>
                  <p className="text-xs text-muted-foreground">Currently connected</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Workflows</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userInstances.filter((i) => i.workflow_id).length}</div>
                  <p className="text-xs text-muted-foreground">AI workflows created</p>
                </CardContent>
              </Card>
            </div>

            {packageInfo && (
              <PackageManagement language="en" packageInfo={packageInfo} onPackageChange={setPackageInfo} />
            )}
          </div>

          {/* Right Column - Instances Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>My WhatsApp Instances</CardTitle>
                    <CardDescription>Manage your WhatsApp bot instances and AI workflows</CardDescription>
                  </div>
                  <Button onClick={handleCreateInstance} disabled={packageInfo?.remaining_instances === 0}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Instance
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {userInstances.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No instances yet</h3>
                    <p className="text-gray-500 mb-4">Create your first WhatsApp bot instance to get started</p>
                    <Button onClick={handleCreateInstance} disabled={packageInfo?.remaining_instances === 0}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Instance
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Instance Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Workflow</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userInstances.map((instance) => (
                        <TableRow key={instance.id}>
                          <TableCell className="font-medium">{instance.instance_name}</TableCell>
                          <TableCell>{getStatusBadge(instance.status)}</TableCell>
                          <TableCell>{instance.workflow_name || "Not created"}</TableCell>
                          <TableCell>{new Date(instance.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteInstance(instance.id)}>
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
