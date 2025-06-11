import { describe, expect, it } from 'vitest'
import { parseGpsLocation } from './'

describe('GPS Utils', () => {
  it('should parse GPS coordinates correctly', () => {
    const result = parseGpsLocation('1 2')
    expect(result).toEqual({ lat: 1, lng: 2 })
  })

  it('should handle invalid GPS input gracefully', () => {
    const result = parseGpsLocation('invalid-input')
    expect(result).toBeNull()
  })

  it('should return null for empty GPS input', () => {
    const result = parseGpsLocation('')
    expect(result).toBeNull()
  })
})
