'use strict'

const btoa = require('btoa')
const request = require('superagent')
const logger = require('./logger.js')()

const API_BASE_URI = 'https://www.transifex.com/api/2/project/streetmix/resource/'
const ERROR_MESSAGE = 'Please provide a Transifex API token to use translation feature.'

/**
 * Retrieves translation resources from Transifex
 *
 * @param {string} locale - locale identifier
 * @param {string} resource - translation resource
 * @returns {Promise}
 */
module.exports = function getFromTransifex (locale, resource) {
  if (!process.env.TRANSIFEX_API_TOKEN) {
    logger.error(ERROR_MESSAGE)
    return Promise.reject(new Error(ERROR_MESSAGE))
  }

  const authToken = btoa('api:' + process.env.TRANSIFEX_API_TOKEN)

  return request
    .get(API_BASE_URI + resource + '/translation/' + locale + '?mode=onlytranslated')
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
