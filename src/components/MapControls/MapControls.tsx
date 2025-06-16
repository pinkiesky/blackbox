import type { ChangeEvent, FC } from 'react'
import {
  Button,
  Radio,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Typography,
  Box,
  type SxProps,
} from '@mui/material'
import { FiltersType } from '@/types/filters.ts'
import { useFiltersStore } from '@/store/filters'

interface Props {
  clear: () => void
}

const styles: SxProps = {
  textAlign: 'left',
}

const MapControls: FC<Props> = ({ clear }) => {
  const { setCurrentFilter } = useFiltersStore()

  const onFilterChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentFilter(Number(e.target.value) as unknown as FiltersType)
  }

  return (
    <Box sx={styles}>
      <Button variant="contained" fullWidth onClick={clear}>
        Clear data
      </Button>

      <FormControl margin="normal">
        <Typography color="#fff">Filter by</Typography>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          defaultValue={FiltersType.ALTITUDE}
          name="radio-buttons-group"
          onChange={onFilterChanged}
        >
          <FormControlLabel
            value={FiltersType.ALTITUDE}
            control={<Radio color="info" />}
            label="Altitude"
          />
          <FormControlLabel
            value={FiltersType.BAT}
            control={<Radio color="success" />}
            label="Battery"
          />
          <FormControlLabel
            value={FiltersType.SPEED}
            control={<Radio color="secondary" />}
            label="Speed"
          />
        </RadioGroup>
      </FormControl>

    </Box>
  )
}

export default MapControls
