"use client"

import { WhatsAppInstanceManager } from "@/components/whatsapp-instance-manager"

export default function InstancesPage() {
  // Mock user data for the instance manager
  const mockUser = {
    id: 1,
    username: "user",
    email: "user@example.com",
    role: "user",
  }

  // Mock instances data
  const mockInstances = [
    {
      id: 1,
      name: "WhatsApp Instance 1",
      status: "active",
      phone_number: "+1234567890",
      created_at: new Date().toISOString(),
      user_id: mockUser.id,
    },
  ]

  // Mock profile data
  const mockProfile = {
    id: mockUser.id,
    username: mockUser.username,
    role: mockUser.role,
  }

  return <WhatsAppInstanceManager user={mockUser} profile={mockProfile} instances={mockInstances} />
}
