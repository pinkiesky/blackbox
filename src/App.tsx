import { type ChangeEvent, useEffect, useMemo } from 'react'
import { Box, Button, type SxProps, Typography } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { useLocalStorage } from '@uidotdev/usehooks'
import type { Log, RadiomasterLogRecord } from '@/types/data'
import { parseCsv } from '@/utils/parse'
import { parseDate } from '@/utils/date'
import { useDataStore } from '@/store/data.ts'
import VisuallyHiddenInput from '@/components/ui/VisuallyHiddenInput.tsx'
import MapControls from '@/components/MapControls/MapControls.tsx'
import Map from '@/components/Map/Map.tsx'
import { parseRadiomasterLogs } from './utils/parse/parseRadiomasterLog'

const styles: Record<string, SxProps> = {
  app: {
    padding: '2rem',
  },
  map: {
    display: 'flex',
    gap: '24px',
    maxWidth: '1280px',
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
}

function App() {
  const [data, saveData] = useLocalStorage<Log | null>('Log', null)
  const { setData } = useDataStore()

  // calculate value
  const isLoaded = useMemo(() => {
    return data !== null
  }, [data]);

  useEffect(() => {
    setData(data)
  }, [])

  const onUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    saveData(await parseRadiomasterLogs(text))
  }

  const clearData = () => {
    saveData(null)
  }

  return (
    <>
      {!isLoaded && (
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

      {isLoaded && (
        <Box sx={styles.map}>
          <Box sx={styles.mapInfo}>
            <Typography sx={styles.mapTitle}>
              {data?.title || 'Unknown Log'}
            </Typography>

            <MapControls clear={clearData} />
          </Box>

          <Map data={data!} />
        </Box>
      )}
    </>
  )
}

export default App
