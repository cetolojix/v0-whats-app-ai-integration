"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  MessageSquare,
  Search,
  User,
  Bot,
  Clock,
  Phone,
  MoreVertical,
  Archive,
  UserCheck,
  MessageCircle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Conversation {
  id: string
  phone_number: string
  contact_name: string | null
  last_message_at: string
  message_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Message {
  id: string
  message_id: string
  sender_phone: string
  recipient_phone: string
  message_type: string
  content: string
  media_url: string | null
  is_from_bot: boolean
  ai_response_generated: boolean
  ai_model_used: string | null
  processing_time_ms: number | null
  created_at: string
}

interface ConversationManagerProps {
  instanceId: string
  instanceName: string
}

export function ConversationManager({ instanceId, instanceName }: ConversationManagerProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)

  const fetchConversations = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        limit: "50",
      })

      const response = await fetch(`/api/conversations/${instanceId}?${params}`)
      const data = await response.json()

      if (response.ok) {
        setConversations(data.conversations)
      } else {
        console.error("Failed to fetch conversations:", data.error)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    setMessagesLoading(true)
    try {
      const response = await fetch(`/api/conversations/${instanceId}/${conversationId}/messages`)
      const data = await response.json()

      if (response.ok) {
        setMessages(data.messages)
      } else {
        console.error("Failed to fetch messages:", data.error)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setMessagesLoading(false)
    }
  }

  const toggleConversationStatus = async (conversationId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/conversations/${instanceId}/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      })

      if (response.ok) {
        fetchConversations()
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation((prev) => (prev ? { ...prev, is_active: !isActive } : null))
        }
      }
    } catch (error) {
      console.error("Error updating conversation status:", error)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [instanceId, searchTerm, statusFilter])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const getInitials = (name: string | null, phone: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return phone.slice(-2)
  }

  return (
    <div className="h-[600px] border rounded-lg overflow-hidden">
      <div className="flex h-full">
        {/* Conversations List */}
        <div className="w-1/3 border-r bg-muted/20">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5" />
              <h3 className="font-semibold">Conversations</h3>
              <Badge variant="secondary" className="ml-auto">
                {conversations.length}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Archived</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No conversations found</div>
            ) : (
              <div className="p-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                      selectedConversation?.id === conversation.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-xs">
                          {getInitials(conversation.contact_name, conversation.phone_number)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {conversation.contact_name || "Unknown Contact"}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.last_message_at)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground truncate">{conversation.phone_number}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant={conversation.is_active ? "default" : "secondary"} className="text-xs">
                            {conversation.message_count} messages
                          </Badge>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleConversationStatus(conversation.id, conversation.is_active)
                                }}
                              >
                                {conversation.is_active ? (
                                  <>
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archive
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Messages View */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-background">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getInitials(selectedConversation.contact_name, selectedConversation.phone_number)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{selectedConversation.contact_name || "Unknown Contact"}</h3>
                    <p className="text-sm text-muted-foreground">{selectedConversation.phone_number}</p>
                  </div>
                  <Badge variant={selectedConversation.is_active ? "default" : "secondary"}>
                    {selectedConversation.is_active ? "Active" : "Archived"}
                  </Badge>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="text-center text-muted-foreground">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground">No messages in this conversation</div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.is_from_bot ? "justify-start" : "justify-end"}`}
                      >
                        <div className={`flex gap-3 max-w-[80%] ${message.is_from_bot ? "" : "flex-row-reverse"}`}>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {message.is_from_bot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </AvatarFallback>
                          </Avatar>

                          <div
                            className={`rounded-lg p-3 ${
                              message.is_from_bot ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                              <Clock className="h-3 w-3" />
                              {new Date(message.created_at).toLocaleTimeString()}
                              {message.is_from_bot && message.ai_model_used && (
                                <Badge variant="outline" className="text-xs">
                                  {message.ai_model_used}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a Conversation</h3>
                <p className="text-sm">Choose a conversation from the list to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
