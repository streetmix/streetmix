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

      res.set({
        'Content-Type': 'application/json; charset=utf-8',
        'Location': config.restapi.baseuri + '/v1/translate/' + locale,
        'Cache-Control': 'max-age=86400'
      })
      res.status(200).send(data)
    })
  }

  // Use the Transifex API
  var handleGetFromTransifex = function (locale, resource) {
    if (!process.env.TRANSIFEX_USERNAME || !process.env.TRANSIFEX_PASSWORD) {
      logger.error('Need Transifex username or password.')
      handleGetLocalTranslation(locale, resource) // fall back to local translation
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
          handleGetLocalTranslation(locale, resource) // fall back to local translation
          return
        }

        var translation = JSON.parse(data.body.content)

        res.set({
          'Content-Type': 'application/json; charset=utf-8',
          'Location': config.restapi.baseuri + '/v1/translate/' + locale + '/' + resource,
          'Cache-Control': 'max-age=86400'
        })

        res.status(200).send(translation)
      })

  } // END function - handleGetFromTransifex

  if (!req.params.locale_code || !req.params.resource_name) {
    res.status(400).json({ status: 400, msg: 'Please provide locale code.' })
    return
  }

  handleGetFromTransifex(req.params.locale_code, req.params.resource_name)
}
