export const verificationCodes = new Map<string, { code: string; timestamp: number }>()

export function storeVerificationCode(phone: string, code: string) {
  console.log("[v0] BEFORE storing - Map size:", verificationCodes.size)
  console.log("[v0] STORING verification code:", code, "for phone:", phone)

  verificationCodes.set(phone, {
    code,
    timestamp: Date.now(),
  })

  console.log("[v0] AFTER storing - Map size:", verificationCodes.size)
  console.log("[v0] VERIFICATION: Can retrieve code?", verificationCodes.has(phone))
  console.log("[v0] VERIFICATION: Retrieved data:", verificationCodes.get(phone))
}

export function getStoredVerificationCode(phone: string) {
  console.log("[v0] RETRIEVING code for phone:", phone)
  console.log("[v0] CURRENT Map size:", verificationCodes.size)
  console.log("[v0] CURRENT Map keys:", Array.from(verificationCodes.keys()))

  const result = verificationCodes.get(phone)
  console.log("[v0] RETRIEVED result:", result)

  return result
}

export function deleteVerificationCode(phone: string) {
  console.log("[v0] DELETING verification code for phone:", phone)
  verificationCodes.delete(phone)
  console.log("[v0] AFTER deletion - Map size:", verificationCodes.size)
}
