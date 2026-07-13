import { NextResponse } from 'next/server'
import type { z } from 'zod'

// ponytail: in-memory Map — resets on redeploy, not shared across instances.
// Switch to IndexedDB or a shared store if multi-server deployment is needed.
const requests = new Map<string, { count: number; reset: number }>()

export function resetRateLimit() {
  requests.clear()
}

export function getClientKey(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export function rateLimit(route: string, request: Request, max = 10, windowMs = 60_000) {
  const key = `${route}:${getClientKey(request)}`
  const now = Date.now()
  const entry = requests.get(key)
  if (!entry || now > entry.reset) {
    requests.set(key, { count: 1, reset: now + windowMs })
    return true
  }
  if (entry.count >= max) return false
  entry.count++
  return true
}

export function validateBody<T>(
  schema: z.ZodType<T>,
  body: unknown,
): { data?: T; error?: NextResponse } {
  const result = schema.safeParse(body)
  if (!result.success) {
    return {
      error: NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 },
      ),
    }
  }
  return { data: result.data }
}
