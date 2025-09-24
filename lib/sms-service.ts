// SMS gönderim servisi
interface SMSCredentials {
  username: string
  password: string
  resellerId: number
}

interface SMSMessage {
  phone: string
  message: string
  senderName?: string
}

interface SMSResponse {
  success: boolean
  message: string
  data?: any
}

export class SMSService {
  private credentials: SMSCredentials

  constructor() {
    this.credentials = {
      username: process.env.SMS_USERNAME || "mozella",
      password: process.env.SMS_PASSWORD || "8vnC7QGIm7u1",
      resellerId: Number.parseInt(process.env.SMS_RESELLER_ID || "2"),
    }
  }

  async sendSMS({ phone, message, senderName = "MOZELLA" }: SMSMessage): Promise<SMSResponse> {
    try {
      // Telefon numarasını formatla (90 ile başlamalı)
      const formattedPhone = phone.startsWith("+90")
        ? phone.substring(3)
        : phone.startsWith("90")
          ? phone
          : phone.startsWith("0")
            ? "90" + phone.substring(1)
            : "90" + phone

      const payload = {
        Credential: {
          Username: this.credentials.username,
          Password: this.credentials.password,
          ResellerID: this.credentials.resellerId,
        },
        Sms: {
          ToMsisdns: [
            {
              Msisdn: formattedPhone,
              Name: "",
              Surname: "",
              CustomField1: "",
            },
          ],
          ToGroups: [],
          IsCreateFromTeplate: false,
          SmsTitle: "",
          SmsContent: message,
          CanSendSmsToDuplicateMsisdn: false,
          SmsSendingType: "ByNumber",
          SenderName: senderName,
          Route: 0,
          ValidityPeriod: 0,
          DataCoding: "Default",
        },
      }

      console.log("[v0] Sending SMS to:", formattedPhone)

      const response = await fetch("https://api2.ekomesaj.com/json/syncreply/SendInstantSms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const responseText = await response.text()
      console.log("[v0] SMS API Raw Response:", responseText)

      let result: any
      try {
        result = JSON.parse(responseText)
        console.log("[v0] SMS API Parsed Response:", result)
      } catch (parseError) {
        console.error("[v0] JSON Parse Error:", parseError)
        console.log("[v0] Response was not JSON:", responseText)

        // JSON değilse, muhtemelen bir hata mesajı
        return {
          success: false,
          message: `SMS API Hatası: ${responseText.substring(0, 100)}...`,
        }
      }

      if (response.ok && result.MessageID && result.MessageID > 0) {
        return {
          success: true,
          message: "SMS başarıyla gönderildi",
          data: result,
        }
      } else {
        const errorMessage = result.Status?.Description || result.Status?.Message || "Bilinmeyen hata"
        return {
          success: false,
          message: `SMS gönderilemedi: ${errorMessage}`,
        }
      }
    } catch (error) {
      console.error("[v0] SMS sending error:", error)
      return {
        success: false,
        message: "SMS gönderim hatası",
      }
    }
  }

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }
}
