// WhatsApp webhook types and interfaces
export interface WhatsAppMessage {
  id: string
  from: string
  to: string
  timestamp: string
  type: "text" | "image" | "audio" | "video" | "document" | "location" | "contacts"
  text?: {
    body: string
  }
  image?: {
    id: string
    mime_type: string
    sha256: string
    caption?: string
  }
  audio?: {
    id: string
    mime_type: string
    sha256: string
  }
  document?: {
    id: string
    filename: string
    mime_type: string
    sha256: string
    caption?: string
  }
  location?: {
    latitude: number
    longitude: number
    name?: string
    address?: string
  }
  contacts?: Array<{
    name: {
      formatted_name: string
      first_name?: string
      last_name?: string
    }
    phones?: Array<{
      phone: string
      type?: string
    }>
  }>
}

export interface WhatsAppWebhookPayload {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        contacts?: Array<{
          profile: {
            name: string
          }
          wa_id: string
        }>
        messages?: WhatsAppMessage[]
        statuses?: Array<{
          id: string
          status: "sent" | "delivered" | "read" | "failed"
          timestamp: string
          recipient_id: string
        }>
      }
      field: string
    }>
  }>
}

export interface WhatsAppSendMessageRequest {
  messaging_product: "whatsapp"
  to: string
  type: "text" | "image" | "audio" | "document"
  text?: {
    body: string
  }
  image?: {
    link?: string
    id?: string
    caption?: string
  }
  audio?: {
    link?: string
    id?: string
  }
  document?: {
    link?: string
    id?: string
    filename?: string
    caption?: string
  }
}

export interface WhatsAppApiResponse {
  messaging_product: string
  contacts: Array<{
    input: string
    wa_id: string
  }>
  messages: Array<{
    id: string
  }>
}
