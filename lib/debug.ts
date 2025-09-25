// Debug utility to control system logging visibility
const DEBUG_ENABLED = process.env.NODE_ENV === "development" && process.env.ENABLE_DEBUG_LOGS === "true"

export function debugLog(message: string, ...args: unknown[]): void {
  if (DEBUG_ENABLED) {
    console.log(message, ...args)
  }
}

export function isDebugEnabled(): boolean {
  return DEBUG_ENABLED
}
