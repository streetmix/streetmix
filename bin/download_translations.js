'use strict'

var fs = require('fs')
var downloadTransifex = require('../lib/transifex.js')

var envFile = __dirname + '/../.env'
if (fs.existsSync(envFile)) {
  var env = require('node-env-file')
  env(__dirname + '/../.env')
}

var resources = ['main', 'segment-info']
var languages = ['en@pirate', 'fi', 'de', 'es', 'es_MX', 'pl', 'pt_BR']

var downloadSuccess = function (locale, resource, data) {
  var localeDir = __dirname + '/../assets/locales/' + locale
  var translationFile = localeDir + '/' + resource + '.json'
  var translationText = JSON.stringify(data, null, 2) + '\n'

  fs.stat(localeDir, function (err, stats) {
    if (!stats) {
      fs.mkdirSync(localeDir)
    }
    fs.writeFile(translationFile, translationText, function (err) {
      if (err) {
        console.log('Error occurs during saving of ' + locale + ' translation of ' + resource + '.')
      }
      console.log(locale + ' translation of ' + resource + ' was successfully writen to file.')
    })
  })
}

var downloadError = function (locale, resource) {
  console.log('Error occurs during downloading of ' + locale + ' translation of ' + resource + '.')
}

for (var r in resources) {
  for (var l in languages) {
    downloadTransifex(languages[l], resources[r], downloadError, downloadSuccess)
  }
}
