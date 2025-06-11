import { format, parseISO } from 'date-fns'

export const parseDate = (date: string, time: string) => {
  if (!date && !time) return ''

  const formattedDate = date || format(new Date(), 'yyyy-MM-dd')
  const formattedTime = time || '00:00:00.000'
  const isoString = `${formattedDate}T${formattedTime}`

  return format(parseISO(isoString), 'dd.MM.yyyy HH:mm:ss')
}
