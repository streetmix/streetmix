'use strict'

require('dotenv').config()

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const getFromTransifex = require('../lib/transifex.js')
const languages = require('../app/data/locales.json')

const resources = ['main', 'segment-info']

const downloadSuccess = function (locale, resource, label, data) {
  const localeDir = path.join(__dirname, '/../assets/locales/', locale)
  const translationFile = localeDir + '/' + resource + '.json'
  const translationText = JSON.stringify(JSON.parse(data), null, 2) + '\n' // Add trailing newline at end of file

  fs.stat(localeDir, function (err, stats) {
    if (err) {
      console.error(`Error accessing ${localeDir}.`)
    }
    if (!stats) {
      fs.mkdirSync(localeDir)
    }
    fs.writeFile(translationFile, translationText, function (err) {
      if (err) {
        console.error(chalk`{redBright Error:} {yellowBright ${label} (${locale})} · {magentaBright ${resource}} → {gray ${err}}`)
      }

      console.log(chalk`{yellowBright ${label} (${locale})} · {magentaBright ${resource}} → {gray ${translationFile.replace(process.cwd(), '.')}}`)
    })
  })
}

const downloadError = function (locale, resource, label, error) {
  console.error(chalk`{redBright Error:} {yellowBright ${label} (${locale})} · {magentaBright ${resource}} → {gray ${error}}`)
}

for (let r in resources) {
  for (let l in languages) {
    // Skip English
    if (languages[l].value === 'en') {
      continue
    }

    getFromTransifex(languages[l].value, resources[r], process.env.TRANSIFEX_API_TOKEN)
      .then((data) => {
        downloadSuccess(languages[l].value, resources[r], languages[l].label, data)
      })
      .catch((error) => {
        downloadError(languages[l].value, resources[r], languages[l].label, error)
      })
  }
}
