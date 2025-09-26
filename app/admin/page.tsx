import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  // Mock admin user
  const mockUser = {
    id: "admin-1",
    email: "admin@example.com",
    role: "admin",
  }

  // Mock users data
  const mockUsers = [
    {
      id: "user-1",
      email: "user1@example.com",
      full_name: "User One",
      role: "user",
      created_at: new Date().toISOString(),
    },
    {
      id: "user-2",
      email: "user2@example.com",
      full_name: "User Two",
      role: "user",
      created_at: new Date().toISOString(),
    },
  ]

  // Mock instances data
  const mockInstances = [
    {
      id: "instance-1",
      name: "WhatsApp Bot 1",
      status: "active",
      user_id: "user-1",
      user_email: "user1@example.com",
      user_full_name: "User One",
      user_role: "user",
      created_at: new Date().toISOString(),
    },
    {
      id: "instance-2",
      name: "WhatsApp Bot 2",
      status: "inactive",
      user_id: "user-2",
      user_email: "user2@example.com",
      user_full_name: "User Two",
      user_role: "user",
      created_at: new Date().toISOString(),
    },
  ]

  return <AdminDashboard users={mockUsers} instances={mockInstances} currentUser={mockUser} />
}
