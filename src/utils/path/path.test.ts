import { describe, it, expect } from 'vitest'
import { getPathColor } from './'

describe('path color', () => {
  it('should return the correct color for a given path', () => {
    expect(getPathColor(30)).toBe('green')
    expect(getPathColor(150)).toBe('red')
    expect(getPathColor(75)).toBe('yellow')
  })

  it('should handle invalid paths gracefully', () => {
    expect(getPathColor(-10)).toBe('green')
    expect(getPathColor(0)).toBe('green')
  })

  it('should return a default color when no path is provided', () => {
    expect(getPathColor(NaN)).toBe('green')
  })
})
