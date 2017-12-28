'use strict'

const fs = require('fs')
const config = require('config')
const logger = require('../../../lib/logger.js')()
const getFromTransifex = require('../../../lib/transifex.js')

function getLocalTranslation (res, locale, resource) {
  const translationFile = process.cwd() + '/assets/locales/' + locale + '/' + resource + '.json'

  fs.readFile(translationFile, 'utf8', (err, data) => {
    if (err) {
      logger.error(err)
      if (err.code === 'ENOENT') {
        res.status(404).json({ status: 404, msg: 'No translation found with locale code: ' + locale })
      } else {
        res.status(500).json({ status: 500, msg: 'Could not retrieve translation.' })
      }
      return
    }

    sendSuccessResponse(locale, resource, data)
  })
}

function sendSuccessResponse (res, locale, resource, translation) {
  res.set({
    'Content-Type': 'application/json; charset=utf-8',
    'Location': config.restapi.baseuri + '/v1/translate/' + locale + '/' + resource,
    'Cache-Control': 'max-age=86400'
  })

  res.status(200).send(translation)
}

exports.get = (req, res) => {
  const locale = req.params.locale_code
  const resource = req.params.resource_name

  if (!locale || !resource) {
    res.status(400).json({ status: 400, msg: 'Please provide locale code.' })
    return
  }

  getFromTransifex(locale, resource)
    .then((translation) => {
      sendSuccessResponse(res, locale, resource, translation)
    })
    .catch(() => {
      getLocalTranslation(res, locale, resource)
    })
}
