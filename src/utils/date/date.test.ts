import { expect, it, describe } from 'vitest'
import { parseDate } from './'

describe('Parsing date', () => {
  it('parses date and time correctly', () => {
    expect(parseDate('2023-10-01', '12:00:00.000')).toBe('01.10.2023 12:00:00')
  })

  it('returns empty string for empty inputs', () => {
    expect(parseDate('', '')).toBe('')
  })

  it('handles date without time', () => {
    expect(parseDate('2023-10-01', '')).toBe('01.10.2023 00:00:00')
  })

  it('handles time without date', () => {
    const currentDate = new Date().toLocaleDateString('ru-RU')
    expect(parseDate('', '12:00:00.000')).toBe(`${currentDate} 12:00:00`)
  })
})
