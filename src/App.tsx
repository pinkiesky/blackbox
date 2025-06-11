import { parse } from 'csv-parse/browser/esm'
import { type ChangeEvent, useState } from 'react'
import { Button } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import type { DataRecord } from './types/Data'
import VisuallyHiddenInput from '@/components/ui/VisuallyHiddenInput.tsx'
import Map from '@/components/Map/Map.tsx'

import './App.css'

function App() {
  const [parsedData, setParsedData] = useState<DataRecord[]>([])

  const onUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()

    parse(
      text,
      {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      },
      (err, records) => {
        if (err) {
          console.error(err)
          return
        }

        setParsedData(records)
      },
    )
  }

  return (
    <>
      {parsedData.length === 0 && (
        <>
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
        </>
      )}

      {parsedData.length > 0 && <Map data={parsedData} />}
    </>
  )
}

export default App
