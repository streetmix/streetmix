'use strict'

var btoa = require('btoa')
var request = require('superagent')
var logger = require('./logger.js')()

module.exports = function (locale, resource, err_cb, succ_cb) {
  if (!process.env.TRANSIFEX_USERNAME || !process.env.TRANSIFEX_PASSWORD) {
    logger.error('Need Transifex username or password.')
    err_cb(locale, resource) // fall back to local translation
    return
  }

  var authToken = btoa(process.env.TRANSIFEX_USERNAME + ':' + process.env.TRANSIFEX_PASSWORD)
  var apiBaseURI = 'https://www.transifex.com/api/2/project/streetmix/resource/'

  request
    .get(apiBaseURI + resource + '/translation/' + locale)
    .set('Authorization', 'Basic ' + authToken)
    .set('Accept', 'application/json')
    .end(function (err, data) {
      if (err) {
        logger.error(err)
        err_cb(locale, resource) // fall back to local translation
        return
      }

      var translation = JSON.parse(data.body.content)

      succ_cb(locale, resource, translation)
    })

}
