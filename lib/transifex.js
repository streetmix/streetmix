'use strict'

const btoa = require('btoa')
const axios = require('axios')
const logger = require('../app/lib/logger.js')

const API_BASE_URI =
  'https://www.transifex.com/api/2/project/streetmix/resource/'
const ERROR_MESSAGE =
  'Please provide a Transifex API token to use translation feature.'

/**
 * Retrieves translation resources from Transifex
 *
 * @param {string} locale - locale identifier
 * @param {string} resource - translation resource
 * @param {string} token - Transifex API token
 * @returns {Promise}
 */
module.exports = async function getFromTransifex (locale, resource, token) {
  if (!token) {
    logger.error(ERROR_MESSAGE)
    return Promise.reject(new Error(ERROR_MESSAGE))
  }

  const authToken = btoa('api:' + token)

  // Special case for Spanish (Latin America) - the browser standard is to
  // use `es-419` but in Transifex this is `es_419`. We need to convert the
  // dash to an underscore for this URL.
  if (locale === 'es-419') {
    locale = 'es_419'
  }

  const response = await axios.request({
    url:
      API_BASE_URI +
      resource +
      '/translation/' +
      locale +
      '?mode=onlytranslated',
    method: 'get',
    headers: {
      Authorization: 'Basic ' + authToken,
      Accept: 'application/json'
    }
  })

  return response.data.content
}
