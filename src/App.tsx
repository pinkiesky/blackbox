import { type ChangeEvent, useState } from 'react'
import { Button } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import type { DataRecord } from '@/types/data'
import { parseCsv } from '@/utils/parse'
import VisuallyHiddenInput from '@/components/ui/VisuallyHiddenInput.tsx'
import Map from '@/components/Map/Map.tsx'

import './App.css'

function App() {
  const [parsedData, setParsedData] = useState<DataRecord[]>([])

  const onUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    setParsedData(await parseCsv(text))
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
