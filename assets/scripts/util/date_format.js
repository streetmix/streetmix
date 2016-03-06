'use strict'

var DATE_FORMAT = 'MMM D, YYYY'

var moment = require('moment')

module.exports = function _formatDate (dateString) {
  var today = moment().format(DATE_FORMAT)
  var date = moment(dateString).format(DATE_FORMAT)

  if (date !== today) {
    return date
  } else {
    return ''
  }
}
