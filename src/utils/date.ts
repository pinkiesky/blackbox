import { format, parseISO } from 'date-fns'

export const parseDate = (date: string, time: string) => {
  if (!date && !time) return ''

  const fullDate = `${date} ${time}`
  return format(parseISO(fullDate), 'dd.MM.yyyy HH:mm:ss')
}
