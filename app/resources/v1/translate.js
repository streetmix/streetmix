'use strict'

const fs = require('fs')
const util = require('util')
const logger = require('../../../lib/logger.js')()
const getFromTransifex = require('../../../lib/transifex.js')

const readFile = util.promisify(fs.readFile)

async function getLocalTranslation (res, locale, resource) {
  const translationFile =
    process.cwd() + '/assets/locales/' + locale + '/' + resource + '.json'

  try {
    return await readFile(translationFile, 'utf8')
  } catch (err) {
    logger.error(err)

    if (err.code === 'ENOENT') {
      res.status(404).json({
        status: 404,
        msg: 'No translation found with locale code: ' + locale
      })
    } else {
      res.status(500).json({
        status: 500,
        msg: 'Could not retrieve translation for locale: ' + locale
      })
    }
  }
}

function sendSuccessResponse (res, locale, resource, translation) {
  res.set({
    'Content-Type': 'application/json; charset=utf-8',
    Location: '/api/v1/translate/' + locale + '/' + resource,
    'Cache-Control': 'max-age=86400'
  })

  res.status(200).send(translation)
}

exports.get = async (req, res) => {
  const locale = req.params.locale_code
  const resource = req.params.resource_name

  if (!locale || !resource) {
    res.status(400).json({ status: 400, msg: 'Please provide locale code.' })
    return
  }

  let translation

  try {
    if (typeof process.env.TRANSIFEX_API_TOKEN === 'undefined') {
      translation = await getLocalTranslation(res, locale, resource)
    } else {
      translation = await getFromTransifex(
        locale,
        resource,
        process.env.TRANSIFEX_API_TOKEN
      )
    }
  } catch (err) {
    logger.error(err)

    res.status(500).json({
      status: 500,
      msg: 'Could not retrieve translation for locale: ' + locale
    })
  }

  if (translation) {
    sendSuccessResponse(res, locale, resource, translation)
  }
}
