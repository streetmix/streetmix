const DATE_FORMAT = 'MMM D, YYYY'

import moment from 'moment'

export function formatDate (dateString) {
  let today = moment().format(DATE_FORMAT)
  let date = moment(dateString).format(DATE_FORMAT)

  return (date !== today) ? date : ''
}
