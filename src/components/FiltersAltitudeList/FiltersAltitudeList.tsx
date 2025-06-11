import type { FC } from 'react'
import {
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material'
import { FiltersType } from '@/types/filters.ts'
import { useFlightFilter } from '@/hooks/useFlightFilter'
import { useFiltersStore } from '@/store/filters.ts'

import styles from './styles.module.css'

const FiltersAltitudeList: FC = () => {
  const { setFilter } = useFiltersStore()

  const { formattedItems } = useFlightFilter<'Alt(m)'>({
    value: 'Alt(m)',
  })

  return (
    <List className={styles.list}>
      {formattedItems.map((item, index) => (
        <ListItem key={index} disablePadding>
          <ListItemButton
            disableGutters
            onClick={() => setFilter(FiltersType.ALTITUDE, item)}
          >
            <ListItemText>
              <div className={styles.date}>{item.normalizedDate}</div>
              <div style={{ display: 'inline-block' }}>{item.value} m</div>

              {item.isMin && (
                <Chip
                  label="MIN"
                  color="success"
                  size="small"
                  sx={{ marginLeft: 1 }}
                />
              )}
              {item.isMax && (
                <Chip
                  label="MAX"
                  color="error"
                  size="small"
                  sx={{ marginLeft: 1 }}
                />
              )}
            </ListItemText>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )
}

export default FiltersAltitudeList
