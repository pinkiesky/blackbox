import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Box, Button, type SxProps, Typography } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { useLocalStorage } from '@uidotdev/usehooks'
import VisuallyHiddenInput from '@/components/ui/VisuallyHiddenInput.tsx'
import MapControls from '@/components/MapControls/MapControls.tsx'
import Map from '@/components/Map/Map.tsx'
import LogChart from '@/components/LogChart/LogChart.tsx'
import { useLogStore } from '@/store/log.ts'
import type { DraggableSelectEvent } from '@/utils/chart'
import { resampleData } from './parse/resampler/resampler'
import { parseEdgeTxLogs } from './parse/edgetx/parseEdgeTxLog'
import type { Log, LogStatistics } from './parse/types'
import { ValueStatCalculator } from './math/ValueStatCalculator'
import { DistanceCalculator } from './math/DistanceCalculator'
import { DerivativeCalculator } from './math/DerivativeCalculator'
import type { GetSegmentConfigOptions } from './components/MapPolylines/MapLogPathRenderer'
import { interpolateHsl } from 'd3-interpolate'
import type { Segment } from './types/data'

const styles: Record<string, SxProps> = {
  app: {
    padding: '2rem',
  },
  map: {
    display: 'flex',
    gap: '24px',
    maxWidth: '1280px',
    paddingTop: '2rem',
    margin: '0 auto',
    textAlign: 'center',
  },
  mapInfo: {
    minWidth: '300px',
  },
  mapTitle: {
    marginBottom: '12px',
    textAlign: 'left',
    fontSize: '20px',
  },
  chart: {
    marginTop: '24px',
  },
}

function App() {
  const [data, saveData] = useLocalStorage<string | null>('RawData2', null)
  const { setLog } = useLogStore()

  const [rawLog, setRawLog] = useState<Log | null>(null)
  const [selectedRange, setSelectedRange] = useState<[number, number] | null>(
    null,
  )

  useEffect(() => {
    if (!data) {
      setRawLog(null)
      return
    }
    let ignore = false

    parseRawData(data)
      .catch((error) => {
        alert('Error parsing log: ' + error.message)
        console.error('Error parsing log:', error)
        return null
      })
      .then((parsed) => {
        if (ignore) return
        setRawLog(parsed)
      })

    return () => {
      ignore = true
    }
  }, [data])

  const log = useMemo(() => {
    if (!rawLog) {
      return null
    }

    const logData: Log = {
      ...rawLog,
    }
    logData.records = resampleData(rawLog.records, 0.5)
    setLog(logData)

    return logData
  }, [rawLog])

  const globalLogStatistic = useMemo<LogStatistics | null>(() => {
    if (!rawLog) {
      return null
    }

    const altitudeCalculator = new ValueStatCalculator()
    const speedCalculator = new ValueStatCalculator()
    const transmitterPowerCalculator = new ValueStatCalculator()
    const transmitterQualityCalculator = new ValueStatCalculator()
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

    const stats: LogStatistics = {
      altitude: altitudeCalculator.getValue(),
      groundSpeedKmh: speedCalculator.getValue(),
      transmitterPowerMw: transmitterPowerCalculator.getValue(),
      transmitterLinkQuality: transmitterQualityCalculator.getValue(),
      totalDistanceM: distanceCalculator.getDistance().totalDistanceM,
    }

    return stats
  }, [rawLog])

  const parseRawData = async (rawData: string): Promise<Log> => {
    console.log('Parsing raw data...', rawData.length, 'characters')
    return await parseEdgeTxLogs(rawData)
  }

  const onRangeSelect = ({ range }: DraggableSelectEvent) => {
    if (range[0] === range[1]) {
      setSelectedRange(null)
      return
    }

    setSelectedRange(range)
  }

  const onUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    saveData(text)
  }

  const clearData = () => {
    saveData(null)
  }

  const lchCb = useCallback(
    (opts: GetSegmentConfigOptions): Segment['config'] => {
      if (selectedRange) {
        const [start, end] = selectedRange
        if (
          opts.usedRecords[0].flightTimeSec < start ||
          opts.usedRecords[opts.usedRecords.length - 1].flightTimeSec > end
        ) {
          return {
            opacity: 0.5,
            color: 'gray',
            weight: 1,
          }
        }
      }
      if (!globalLogStatistic) {
        return {
          opacity: 0.5,
          color: 'gray',
          weight: 1,
        }
      }

      const avgSegment =
        opts.usedRecords.reduce((acc, record) => {
          return record.altitudeM + acc
        }, 0) / opts.usedRecords.length
      const color = interpolateHsl(
        'green',
        'red',
      )(avgSegment / globalLogStatistic.altitude.max)
      return {
        opacity: 0.7,
        color,
        weight: 5,
      }
    },
    [globalLogStatistic, selectedRange],
  )

  return (
    <>
      {!log && (
        <Box sx={styles.app}>
          <h1>Blackbox</h1>

          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            size="large"
            startIcon={<CloudUploadIcon />}
          >
            Import .CSV file
            <VisuallyHiddenInput
              type="file"
              onChange={onUploadFile}
              accept=".csv"
            />
          </Button>
        </Box>
      )}

      {log && globalLogStatistic && (
        <>
          <Box sx={styles.map}>
            <Box sx={styles.mapInfo}>
              <Typography sx={styles.mapTitle}>
                {log.title || 'Unknown Log'}
              </Typography>

              <MapControls clear={clearData} />
            </Box>

            <Map segmentDataCallback={lchCb} />
          </Box>
          <Box sx={styles.chart}>
            <LogChart onSelect={onRangeSelect} />
          </Box>
        </>
      )}
    </>
  )
}

export default App
