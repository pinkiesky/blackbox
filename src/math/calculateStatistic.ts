import type { Log, LogStatistics } from '@/parse/types'
import { ValueStatCalculator } from './ValueStatCalculator'
import { DistanceCalculator } from './DistanceCalculator'
import { DerivativeCalculator } from './DerivativeCalculator'

export interface CalculateStatisticOptions {
  fromSec?: number
  untilSec?: number
}

export function calculateStatistic(
  log: Log | null,
  options: CalculateStatisticOptions = {},
): LogStatistics | null {
  if (!log || !log.records || log.records.length === 0) {
    return null
  }

  const altitudeCalculator = new ValueStatCalculator()
  const speedCalculator = new ValueStatCalculator()
  const transmitterPowerCalculator = new ValueStatCalculator()
  const transmitterQualityCalculator = new ValueStatCalculator()
  const distanceCalculator = new DistanceCalculator()
  const rollDerivativeCalculator = new DerivativeCalculator()
  for (let i = 0; i < log.records.length; i++) {
    const record = log.records[i]
    if (
      (options.fromSec !== undefined &&
        record.flightTimeSec < options.fromSec) ||
      (options.untilSec !== undefined &&
        record.flightTimeSec > options.untilSec)
    ) {
      continue
    }

    const prevRecord = log.records[i - 1] || null
    const weight = prevRecord
      ? record.flightTimeSec - prevRecord.flightTimeSec
      : 1

    altitudeCalculator.addValueWeighted(record.altitudeM, weight)
    speedCalculator.addValueWeighted(record.groundSpeedKmh, weight)
    transmitterPowerCalculator.addValueWeighted(
      record.transmitterPowerMw,
      weight,
    )
    transmitterQualityCalculator.addValueWeighted(
      record.transmitterLinkQuality,
      weight,
    )
    distanceCalculator.addPoint(record.coordinates, record.altitudeM)
    rollDerivativeCalculator.addValue(record.rollRad, weight)
  }

  return {
    altitude: altitudeCalculator.getValue(),
    groundSpeedKmh: speedCalculator.getValue(),
    transmitterPowerMw: transmitterPowerCalculator.getValue(),
    transmitterLinkQuality: transmitterQualityCalculator.getValue(),
    totalDistanceM: distanceCalculator.getDistance().totalDistanceM,
  }
}
