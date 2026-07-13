export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public retryable = false,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 2,
  timeoutMs = 10_000,
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new ApiError(
          `${res.status} ${res.statusText}: ${body.slice(0, 200)}`,
          res.status,
          res.status >= 500,
        )
      }
      return res
    } catch (err) {
      clearTimeout(timeoutId)
      if (err instanceof ApiError && !err.retryable) throw err
      if (attempt < retries) {
        const delay = Math.min(1000 * 2 ** attempt, 5000)
        await new Promise((r) => setTimeout(r, delay))
        continue
      }
      throw err
    }
  }

  throw new Error('Unreachable')
}
