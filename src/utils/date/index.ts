import { format, parseISO } from 'date-fns'

interface Options {
  dateFormat: string
}

export const parseDate = (
  date: Date | string,
  time?: string,
  options?: Options,
) => {
  if (!date && !time) return ''

  let isoString = date.toLocaleString() || format(new Date(), 'yyyy-MM-dd')
  let formatStr = options?.dateFormat || 'dd.MM.yyyy'

  if (time) {
    isoString += `T${time}`
    formatStr += ` HH:mm:ss`
  }

  return format(parseISO(isoString), formatStr)
}
