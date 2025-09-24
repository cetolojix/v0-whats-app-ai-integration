import type { WhatsAppSendMessageRequest, WhatsAppApiResponse } from "./types"

export class WhatsAppClient {
  private baseUrl: string
  private accessToken: string
  private phoneNumberId: string

  constructor(accessToken: string, phoneNumberId: string) {
    this.baseUrl = "https://graph.facebook.com/v18.0"
    this.accessToken = accessToken
    this.phoneNumberId = phoneNumberId
  }

  async sendMessage(request: WhatsAppSendMessageRequest): Promise<WhatsAppApiResponse> {
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`WhatsApp API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  async sendTextMessage(to: string, text: string): Promise<WhatsAppApiResponse> {
    return this.sendMessage({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    })
  }

  async markAsRead(messageId: string): Promise<void> {
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`

    await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      }),
    })
  }
}

// Factory function to create WhatsApp client for an instance
export function createWhatsAppClient(instanceKey: string): WhatsAppClient | null {
  // In a real implementation, you would fetch the access token and phone number ID
  // from your database or configuration based on the instance key

  // For now, return null if no configuration is found
  // This should be replaced with actual configuration lookup
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!accessToken || !phoneNumberId) {
    console.warn(`[WhatsApp] No configuration found for instance: ${instanceKey}`)
    return null
  }

  return new WhatsAppClient(accessToken, phoneNumberId)
}
