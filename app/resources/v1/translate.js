'use strict'

var config = require('config')
var fs = require('fs')
var btoa = require('btoa')
var request = require('superagent')
var logger = require('../../../lib/logger.js')()

exports.get = function (req, res) {
  var handleGetTranslation = function (locale) {
    var translationFile = process.cwd() + '/assets/locales/' + locale + '/translation.json'

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

  } // END function - handleGetTranslation

  // Use the Transifex API
  var handleGetFromTransifex = function (locale) {
    if (!process.env.TRANSIFEX_USERNAME || !process.env.TRANSIFEX_PASSWORD) {
      logger.error('Need Transifex username or password.')
      res.status(501).json({ status: 501, msg: 'Language API is not implemented.' })
      return
    }

    var authToken = btoa(process.env.TRANSIFEX_USERNAME + ':' + process.env.TRANSIFEX_PASSWORD)
    var apiBaseURI = 'https://www.transifex.com/api/2/project/streetmix/resource/main/translation/'

    request
      .get(apiBaseURI + locale)
      .set('Authorization', 'Basic ' + authToken)
      .set('Accept', 'application/json')
      .end(function (err, data) {
        if (err) {
          logger.error(err)
          res.status(500).json({ status: 500, msg: 'There was an error retrieving the language.' })
          return
        }

        var translation = JSON.parse(data.body.content)

        res.set({
          'Content-Type': 'application/json; charset=utf-8',
          'Location': config.restapi.baseuri + '/v1/translate/' + locale,
          'Cache-Control': 'max-age=86400'
        })

        res.status(200).send(translation)
      })

  } // END function - handleGetFromTransifex

  if (!req.params.locale_code) {
    res.status(400).json({ status: 400, msg: 'Please provide locale code.' })
    return
  }

  //handleGetTranslation(req.params.locale_code)
  handleGetFromTransifex(req.params.locale_code)
}
