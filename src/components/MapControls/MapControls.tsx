import type { FC } from 'react'
import { Button } from '@mui/material'

import styles from './styles.module.css'

interface Props {
  clear: () => void
}

const MapControls: FC<Props> = ({ clear }) => {
  return (
    <div className={styles.root}>
      <Button variant="contained" fullWidth onClick={clear}>
        Clear data
      </Button>
    </div>
  )
}

export default MapControls
