import type { Log, LogRecord, RadiomasterLogRecord } from '@/types/data'
import { parseCsv } from '.'
import { safeParseNumber } from '..';

export async function parseRadiomasterLogs(text: string): Promise<Log> {
  const data = await parseCsv(text) as RadiomasterLogRecord[]
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No valid records found in the log.');
  }

  let startTime: Date | null = null;
  let endTime: Date | null = null;

  const records = data.map((record): LogRecord => {
    const parsedDate = new Date(`${record.Date}T${record.Time}Z`);
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date format: ${record.Date} ${record.Time}`);
    }

    if (!startTime) {
      startTime = parsedDate;
    }

    if (!endTime || parsedDate > endTime) {
      endTime = parsedDate;
    }

    const [lat, lng] = record.GPS.split(' ').map(safeParseNumber);
    const coordinates = { lat, lng };

    return {
      flightTimeSec: (parsedDate.getTime() - startTime.getTime()) / 1000,
      coordinates,
      altitude: safeParseNumber(record['Alt(m)']),
      date: parsedDate,
    };
  });

  const durationSec = (endTime!.getTime() - startTime!.getTime()) / 1000;

  return {
    data: records,
    startTime: startTime!,
    endTime: endTime!,
    durationSec,
    title: `Radiomaster Log from ${startTime!.toLocaleString()} to ${endTime!.toLocaleString()}`,
  };
}
