import { parse } from 'csv-parse/browser/esm'
import type { DataRecord } from '@/types/Data'

export function parseCsv(text: string): Promise<DataRecord[]> {
  return new Promise((resolve, reject) => {
    parse(
      text,
      {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      },
      (err, records) => {
        if (err) reject(err)
        else resolve(records)
      },
    )
  })
}
