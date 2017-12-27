'use strict'

const btoa = require('btoa')
const request = require('superagent')
const logger = require('./logger.js')()

const API_BASE_URI = 'https://www.transifex.com/api/2/project/streetmix/resource/'
const ERROR_MESSAGE = 'Need Transifex username or password.'

/**
 * Retrieves translation resources from Transifex
 *
 * @param {string} locale - locale identifier
 * @param {string} resource - translation resource
 * @returns {Promise}
 */
module.exports = function getFromTransifex (locale, resource) {
  if (!process.env.TRANSIFEX_USERNAME || !process.env.TRANSIFEX_PASSWORD) {
    logger.error(ERROR_MESSAGE)
    return Promise.reject(new Error(ERROR_MESSAGE))
  }

  const authToken = btoa(process.env.TRANSIFEX_USERNAME + ':' + process.env.TRANSIFEX_PASSWORD)

  return request
    .get(API_BASE_URI + resource + '/translation/' + locale)
    .set('Authorization', 'Basic ' + authToken)
    .set('Accept', 'application/json')
    .then((data) => {
      return JSON.parse(data.body.content)
    })
    .catch((err) => {
      logger.error(err)

      // Re-throw the error for downstream consumers
      throw new Error(err)
    })
}
