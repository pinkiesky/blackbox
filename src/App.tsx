import { type ChangeEvent, useEffect } from 'react'
import { Button } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { useLocalStorage } from '@uidotdev/usehooks'
import type { DataRecord } from '@/types/data'
import { parseCsv } from '@/utils/parse'
import { parseDate } from '@/utils/date'
import { useDataStore } from '@/store/data.ts'
import VisuallyHiddenInput from '@/components/ui/VisuallyHiddenInput.tsx'
import MapControls from '@/components/MapControls/MapControls.tsx'
import Map from '@/components/Map/Map.tsx'

import './App.css'

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
        <div className="app">
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
        </div>
      )}

      {data.length > 0 && (
        <div className="map">
          <div className="map__info">
            <h2 className="map__title">Blackbox {parseDate(data[0].Date)}</h2>

            <MapControls clear={clearData} />
          </div>

          <Map data={data} />
        </div>
      )}
    </>
  )
}

export default App
