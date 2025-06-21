import { useGlobalLogStatsStore } from '@/store/stats.ts'
import { useEffect } from 'react'
import type { LogStatistics } from '@/types/data'
import {
  DerivativeCalculator,
  DistanceCalculator,
  ValueCalculator,
} from '@/utils/derivative'
import { useLogStore } from '@/store/log.ts'

export function useGlobalLogStats() {
  const { stats, setStats } = useGlobalLogStatsStore()
  const { rawLog } = useLogStore()

  useEffect(() => {
    if (!rawLog) {
      return
    }

    const altitudeCalculator = new ValueCalculator()
    const speedCalculator = new ValueCalculator()
    const transmitterPowerCalculator = new ValueCalculator()
    const transmitterQualityCalculator = new ValueCalculator()
    const distanceCalculator = new DistanceCalculator()
    const rollDerivativeCalculator = new DerivativeCalculator()

    for (let i = 0; i < rawLog.records.length; i++) {
      const record = rawLog.records[i]
      const prevRecord = rawLog.records[i - 1] || null
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

    console.log('Altitude stats:', altitudeCalculator.getValue())
    console.log('Speed stats:', speedCalculator.getValue())
    console.log(
      'Transmitter Power stats:',
      transmitterPowerCalculator.getValue(),
    )
    console.log(
      'Transmitter Quality stats:',
      transmitterQualityCalculator.getValue(),
    )
    console.log(
      'Total distance:',
      distanceCalculator.getDistance().totalDistanceM,
      'm',
    )
    console.log(
      'Roll Derivative stats:',
      rollDerivativeCalculator.getDerivativeData(),
    )

    const newStats: LogStatistics = {
      altitude: altitudeCalculator.getValue(),
      groundSpeedKmh: speedCalculator.getValue(),
      transmitterPowerMw: transmitterPowerCalculator.getValue(),
      transmitterLinkQuality: transmitterQualityCalculator.getValue(),
      totalDistanceM: distanceCalculator.getDistance().totalDistanceM,
    }

    setStats(newStats)
  }, [rawLog])

  return {
    stats,
  }
}
