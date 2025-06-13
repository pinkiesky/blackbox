import type { FC } from 'react'
import {
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  type SxProps,
  Typography,
} from '@mui/material'
import { FiltersType } from '@/types/filters.ts'
import { useFlightFilter } from '@/hooks/useFlightFilter'
import { useFiltersStore } from '@/store/filters.ts'

const styles: Record<string, SxProps> = {
  list: {
    position: 'relative',
    overflow: 'auto',
    maxHeight: '630px',
  },
  date: {
    fontSize: '12px',
    color: '#b3b3b3',
  },
  value: {
    display: 'inline-block',
  },
  chip: {
    marginLeft: '8px',
  },
}

const FiltersAltitudeList: FC = () => {
  const { setFilter } = useFiltersStore()

  const { formattedItems } = useFlightFilter<'Alt(m)'>({
    value: 'Alt(m)',
  })

  return (
    <List sx={styles.list}>
      {formattedItems.map((item, index) => (
        <ListItem key={index} disablePadding>
          <ListItemButton
            disableGutters
            onClick={() => setFilter(FiltersType.ALTITUDE, item)}
          >
            <ListItemText>
              <Typography sx={styles.date}>{item.normalizedDate}</Typography>
              <Typography sx={styles.value}>{item.value} m</Typography>

              {item.isMin && (
                <Chip
                  label="MIN"
                  color="success"
                  size="small"
                  sx={styles.chip}
                />
              )}
              {item.isMax && (
                <Chip label="MAX" color="error" size="small" sx={styles.chip} />
              )}
            </ListItemText>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )
}

export default FiltersAltitudeList
