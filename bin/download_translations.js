'use strict'

const fs = require('fs')
const path = require('path')
const getFromTransifex = require('../lib/transifex.js')

const envFile = path.join(__dirname, '/../.env')
if (fs.existsSync(envFile)) {
  const env = require('node-env-file')
  env(envFile)
}

const resources = ['main', 'segment-info']
const languages = ['en@pirate', 'fi', 'de', 'es', 'es_MX', 'pl', 'pt_BR']

const downloadSuccess = function (locale, resource, data) {
  const localeDir = path.join(__dirname, '/../assets/locales/', locale)
  const translationFile = localeDir + '/' + resource + '.json'
  const translationText = JSON.stringify(data, null, 2) + '\n'

  fs.stat(localeDir, function (err, stats) {
    if (err) {
      console.log('Error accessing ' + localeDir + '.')
    }
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

const downloadError = function (locale, resource, error) {
  console.log('Error occurred during downloading of ' + locale + ' translation of ' + resource + ': ' + error)
}

for (let r in resources) {
  for (let l in languages) {
    getFromTransifex(languages[l], resources[r])
      .then((data) => {
        downloadSuccess(languages[l], resources[r], data)
      })
      .catch((error) => {
        downloadError(languages[l], resources[r], error)
      })
  }
}
