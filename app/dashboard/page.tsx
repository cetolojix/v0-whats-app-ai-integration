import { UserDashboard } from "@/components/user-dashboard"

export default async function DashboardPage() {
  // Mock user data
  const mockUser = {
    id: "user-1",
    email: "user@example.com",
  }

  const mockProfile = {
    id: "user-1",
    email: "user@example.com",
    full_name: "Test User",
    role: "user",
    created_at: new Date().toISOString(),
  }

  // Mock instances data
  const mockInstances = [
    {
      id: "instance-1",
      name: "My WhatsApp Bot",
      status: "active",
      user_id: "user-1",
      created_at: new Date().toISOString(),
    },
  ]

  return <UserDashboard user={mockUser} profile={mockProfile} instances={mockInstances} />
}
