import type { FC } from 'react'
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material'
import { FiltersType } from '@/types/filters.ts'
import { useFlightDates } from '@/hooks/useFlightDates'
import { useFiltersStore } from '@/store/filters.ts'

import styles from './styles.module.css'

const FiltersAltitudeList: FC = () => {
  const { setFilter } = useFiltersStore()

  const { formattedDates } = useFlightDates<'Alt(m)'>({
    item: 'Alt(m)',
  })

  return (
    <List className={styles.list}>
      {formattedDates.map((date, index) => (
        <ListItem key={index} disablePadding>
          <ListItemButton
            disableGutters
            onClick={() => setFilter(FiltersType.ALTITUDE, date)}
          >
            <ListItemText>
              <div className={styles.date}>{date.normalizedDate}</div>
              <div>{date.item} m</div>
            </ListItemText>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )
}

export default FiltersAltitudeList
