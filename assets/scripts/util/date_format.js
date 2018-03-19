import moment from 'moment'
import { t, getLocale } from '../app/locale'

const DATE_FORMAT_NO_YEAR = 'MMM D'
const DATE_FORMAT_WITH_YEAR = 'MMM D, YYYY'
const TIME_FORMAT = 'HH:MM'
const MINUTES_AGO = 1000 * 60 * 10
const SECONDS_AGO = 1000 * 60

export function formatDate (dateString) {
  const now = moment()

  // Set locale for moment
  now.locale(getLocale())

  const date = moment(dateString)
  const diff = now - date

  if (diff >= 0) {
    if (diff < SECONDS_AGO) {
      return t('datetime.seconds-ago', 'A few seconds ago')
    }

    if (diff < MINUTES_AGO) {
      return t('datetime.minutes-ago', 'A few minutes ago')
    }
  }

  const timeFormat = t('datetime.format-time', TIME_FORMAT)

  if (now.isSame(date, 'day')) {
    return t('datetime.today', 'Today at {time}', { time: date.format(timeFormat) })
  }

  if (now.clone().subtract(1, 'day').isSame(date, 'day')) {
    return t('datetime.yesterday', 'Yesterday at {time}', { time: date.format(timeFormat) })
  }

  if (now.isSame(date, 'year')) {
    const dateFormat = t('datetime.format-date-no-year', DATE_FORMAT_NO_YEAR)
    return date.format(dateFormat)
  }

  const dateFormat = t('datetime.format-date-with-year', DATE_FORMAT_WITH_YEAR)
  return date.format(dateFormat)
}
