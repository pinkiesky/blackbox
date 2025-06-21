import type { Log, LogRecord, RadiomasterLogRecord } from '@/types/data'
import { parseCsv } from '.'
import { safeParseNumber } from '../derivative'

export async function parseRadiomasterLogs(text: string): Promise<Log> {
  const data = (await parseCsv(text)) as RadiomasterLogRecord[]
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No valid records found in the log.')
  }

  let startTime: Date | null = null
  let endTime: Date | null = null

  const records = data.map((record): LogRecord => {
    const parsedDate = new Date(`${record.Date}T${record.Time}Z`)
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date format: ${record.Date} ${record.Time}`)
    }

    if (!startTime) {
      startTime = parsedDate
    }

    if (!endTime || parsedDate > endTime) {
      endTime = parsedDate
    }

    const [lat, lng] = record.GPS.split(' ').map(safeParseNumber)
    const coordinates = { lat, lng }

    const data = {
      flightTimeSec: (parsedDate.getTime() - startTime.getTime()) / 1000,
      coordinates,
      altitudeM: safeParseNumber(record['Alt(m)']),
      date: parsedDate,
      groundSpeedKmh: safeParseNumber(record['GSpd(kmh)']),
      headingDeg: safeParseNumber(record['Hdg(°)']),
      transmitterLinkQuality: safeParseNumber(record['TQly(%)']),
      transmitterPowerMw: safeParseNumber(record['TPWR(mW)']),
      amperageCurrentA: safeParseNumber(record['Curr(A)']),
      verticalSpeedMps: safeParseNumber(record['VSpd(m/s)']),
      rollRad: safeParseNumber(record['Roll(rad)']),
      pitchRad: safeParseNumber(record['Ptch(rad)']),
      yawRad: safeParseNumber(record['Yaw(rad)']),
    }

    return data
  })

  const durationSec = (endTime!.getTime() - startTime!.getTime()) / 1000

  // TODO move statistics calculation to a separate function
  return {
    records,
    startTime: startTime!,
    endTime: endTime!,
    durationSec,
    title: `Radiomaster Log from ${startTime!.toLocaleString()} to ${endTime!.toLocaleString()}`,
  }
}
