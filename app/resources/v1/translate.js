'use strict'

var config = require('config')
var fs = require('fs')
var btoa = require('btoa')
var request = require('superagent')
var logger = require('../../../lib/logger.js')()

exports.get = function (req, res) {
  var handleGetLocalTranslation = function (locale, resource) {
    var translationFile = process.cwd() + '/assets/locales/' + locale + '/' + resource + '.json'

    fs.readFile(translationFile, 'utf8', function (err, data) {
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

  var handleGetFromTransifex = require('../../../lib/transifex.js')

  var sendSuccessResponse = function(locale, resource, translation) {
    res.set({
      'Content-Type': 'application/json; charset=utf-8',
      'Location': config.restapi.baseuri + '/v1/translate/' + locale + '/' + resource,
      'Cache-Control': 'max-age=86400'
    })

    res.status(200).send(translation)
  }

  if (!req.params.locale_code || !req.params.resource_name) {
    res.status(400).json({ status: 400, msg: 'Please provide locale code.' })
    return
  }

  handleGetFromTransifex(
    req.params.locale_code,
    req.params.resource_name,
    handleGetLocalTranslation,
    sendSuccessResponse
  )
}
