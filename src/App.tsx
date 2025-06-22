import { type ChangeEvent, useEffect, useMemo } from 'react'
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  type SxProps,
  Typography,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useLogStore } from '@/store/log.ts'
import type { DraggableSelectEvent } from '@/utils/chart'
import { resampleData } from './parse/resampler/resampler'
import { parseEdgeTxLogs } from './parse/edgetx/parseEdgeTxLog'
import type { Log, LogStatistics } from './parse/types'
import { ValueStatCalculator } from './math/ValueStatCalculator'
import { DistanceCalculator } from './math/DistanceCalculator'
import { DerivativeCalculator } from './math/DerivativeCalculator'
import VisuallyHiddenInput from '@/components/ui/VisuallyHiddenInput.tsx'
import Map from '@/components/Map/Map.tsx'
import LogChart from '@/components/LogChart/LogChart.tsx'
import Stats from '@/components/Stats/Stats.tsx'

const styles: Record<string, SxProps> = {
  app: {
    margin: '1rem',
  },
  title: {
    textAlign: 'left',
    fontSize: '1.5rem',
  },
  map: {
    marginTop: '1rem',
  },
  chart: {
    marginTop: '0.5rem',
  },
}

function App() {
  const [data, saveData] = useLocalStorage<string | null>('RawData2', null)
  const { setLog, rawLog, setRawLog } = useLogStore()

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
    console.log(range)
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
        <Container sx={styles.app} maxWidth="xl">
          <Grid container spacing={1} alignItems="center">
            <Grid>
              <Typography sx={styles.title}>
                {log.title || 'Unknown Log'}
              </Typography>
            </Grid>
            <Grid>
              <IconButton
                aria-label="clear"
                color="error"
                size="small"
                onClick={clearData}
              >
                <CloseOutlinedIcon />
              </IconButton>
            </Grid>
          </Grid>

          <Grid container spacing={3} flexDirection="column">
            <Grid size="grow" sx={styles.map} minWidth="1536px">
              <Grid container spacing={1}>
                <Map stat={globalLogStatistic} />
                <Stats stat={globalLogStatistic} />
              </Grid>
            </Grid>
            <Grid size="grow" sx={styles.chart} minWidth="1563px">
              <LogChart onSelect={onRangeSelect} />
            </Grid>
          </Grid>
        </Container>
      )}
    </>
  )
}

export default App
