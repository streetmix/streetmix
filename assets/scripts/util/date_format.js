const DATE_FORMAT_NO_YEAR = 'MMM D'
const DATE_FORMAT = 'MMM D, YYYY'
const TIME_FORMAT = 'HH:MM'
const MINUTES_AGO = 1000 * 60 * 10
const SECONDS_AGO = 1000 * 60

import moment from 'moment'
import { msg } from '../app/messages'

export function formatDate (dateString) {
  const now = moment()
  const date = moment(dateString)
  const diff = now - date

  if (diff >= 0) {
    if (diff < SECONDS_AGO) {
      return msg('DATE_SECONDS_AGO')
    }

    if (diff < MINUTES_AGO) {
      return msg('DATE_MINUTES_AGO')
    }
  }

  if (now.isSame(date, 'day')) {
    return msg('DATE_TODAY', {time: date.format(TIME_FORMAT)})
  }

  if (now.clone().subtract(1, 'day').isSame(date, 'day')) {
    return msg('DATE_YESTERDAY', {time: date.format(TIME_FORMAT)})
  }

  if (now.isSame(date, 'year')) {
    return date.format(DATE_FORMAT_NO_YEAR)
  }

  return date.format(DATE_FORMAT)
}
