import { describe, it, expect } from 'vitest'
import { parseCsv } from './parse.ts'

describe('parseCsv', () => {
  it('should parse CSV text into records', async () => {
    const csvText = `name,age` + `\nAlice,30` + `\nBob,25`

    const expectedRecords = [
      { name: 'Alice', age: '30' },
      { name: 'Bob', age: '25' },
    ]

    const records = await parseCsv(csvText)
    expect(records).toEqual(expectedRecords)
  })

  it('should handle empty lines', async () => {
    const csvText = `name,age` + `\nAlice,30` + `\n` + `\nBob,25`

    const expectedRecords = [
      { name: 'Alice', age: '30' },
      { name: 'Bob', age: '25' },
    ]

    const records = await parseCsv(csvText)
    expect(records).toEqual(expectedRecords)
  })
})
