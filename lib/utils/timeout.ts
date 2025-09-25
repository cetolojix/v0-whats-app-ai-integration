export function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController()

  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  // Clean up timeout if request completes normally
  const originalSignal = controller.signal
  const cleanup = () => clearTimeout(timeoutId)
  originalSignal.addEventListener("abort", cleanup, { once: true })

  return originalSignal
}

// Alternative timeout implementation for older environments
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeoutId))
  })
}
