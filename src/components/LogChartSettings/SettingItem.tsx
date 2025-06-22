import { type ChangeEvent, type FC } from 'react'
import { Checkbox, FormControlLabel, MenuItem } from '@mui/material'
import type { LogRecord } from '@/parse/types'

interface SettingItemProps {
  name: keyof LogRecord
  label?: string
  checked: boolean | undefined
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

const SettingItem: FC<SettingItemProps> = ({
  name,
  label,
  checked,
  onChange,
}) => {
  return (
    <MenuItem>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked ?? false}
            name={name}
            size="small"
            sx={{ padding: '6px' }}
            onChange={onChange}
          />
        }
        label={label ?? name}
      />
    </MenuItem>
  )
}

export default SettingItem
