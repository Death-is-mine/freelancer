import { describe, it, expect, beforeEach } from 'vitest'
import { rateLimit, resetRateLimit, validateBody } from './validate'
import { z } from 'zod'

describe('rateLimit', () => {
  beforeEach(() => resetRateLimit())
  const mockReq = {
    headers: new Map(Object.entries({ 'x-forwarded-for': '127.0.0.1' })),
  } as unknown as Request

  it('allows first request', () => {
    expect(rateLimit('test1', mockReq, 2, 1000)).toBe(true)
  })

  it('blocks after max', () => {
    expect(rateLimit('test2', mockReq, 2, 1000)).toBe(true)
    expect(rateLimit('test2', mockReq, 2, 1000)).toBe(true)
    expect(rateLimit('test2', mockReq, 2, 1000)).toBe(false)
  })
})

describe('validateBody', () => {
  const schema = z.object({ name: z.string().min(1) })

  it('returns data on valid input', () => {
    const result = validateBody(schema, { name: 'test' })
    expect(result.data).toEqual({ name: 'test' })
    expect(result.error).toBeUndefined()
  })

  it('returns error on invalid input', () => {
    const result = validateBody(schema, { name: '' })
    expect(result.data).toBeUndefined()
    expect(result.error).toBeDefined()
  })
})
