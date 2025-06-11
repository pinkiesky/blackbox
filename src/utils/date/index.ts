import { format, parseISO } from 'date-fns'

export const parseDate = (date: string, time?: string) => {
  if (!date && !time) return ''

  let isoString = date || format(new Date(), 'yyyy-MM-dd')
  let formatStr = 'dd.MM.yyyy'

  if (time) {
    isoString += `T${time}`
    formatStr += `HH:mm:ss`
  }

  return format(parseISO(isoString), formatStr)
}
