import { type ChangeEvent, useEffect } from 'react'
import { Box, Button, type SxProps, Typography } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { useLocalStorage } from '@uidotdev/usehooks'
import type { DataRecord } from '@/types/data'
import { parseCsv } from '@/utils/parse'
import { parseDate } from '@/utils/date'
import { useDataStore } from '@/store/data.ts'
import VisuallyHiddenInput from '@/components/ui/VisuallyHiddenInput.tsx'
import MapControls from '@/components/MapControls/MapControls.tsx'
import Map from '@/components/Map/Map.tsx'

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
  const [data, saveData] = useLocalStorage<DataRecord[]>('cvs-data', [])
  const { setData } = useDataStore()

  useEffect(() => {
    setData(data)
  }, [])

  const onUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    saveData(await parseCsv(text))
  }

  const clearData = () => {
    saveData([])
  }

  return (
    <>
      {data.length === 0 && (
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

      {data.length > 0 && (
        <Box sx={styles.map}>
          <Box sx={styles.mapInfo}>
            <Typography sx={styles.mapTitle}>
              Blackbox {parseDate(data[0].Date)}
            </Typography>

            <MapControls clear={clearData} />
          </Box>

          <Map data={data} />
        </Box>
      )}
    </>
  )
}

export default App
