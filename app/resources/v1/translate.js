'use strict';

var config = require('config'),
    fs     = require('fs'),
    logger = require('../../../lib/logger.js')()

exports.get = function (req, res) {

  var handleGetTranslation = function (locale) {

    var translationFile = process.cwd() + '/assets/locales/' + locale + '/translation.json'

    fs.readFile(translationFile, 'utf8', function (err, data) {
      if (err) {
        logger.error(err)
        if (err.code === 'ENOENT') {
          res.status(404).json({status: 404, msg: 'No translation found with locale code: ' + locale })
        } else {
          res.status(500).json({status: 500, msg: 'Could not retrieve translation.'})
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

  } // END function - handleGetlanguage

  if (!req.params.locale_code) {
    res.status(400).json({status: 400, msg: 'Please provide locale code.'})
    return
  }

  handleGetTranslation(req.params.locale_code)

}
