const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const chalk = require('chalk')
const getFromTransifex = require('../app/lib/transifex.js')
const languages = require('../app/data/locales.json')

const resources = ['main', 'segment-info']

if (!process.env.TRANSIFEX_API_TOKEN) {
  console.error('Error: please provide a Transifex API token.')
  process.exit()
}

const downloadSuccess = function (locale, resource, label, data) {
  const localeDir = path.join(__dirname, '/../assets/locales/', locale)
  const translationFile = localeDir + '/' + resource + '.json'
  const translationText = JSON.stringify(JSON.parse(data), null, 2) + '\n' // Add trailing newline at end of file

  mkdirp.sync(localeDir)
  fs.writeFile(translationFile, translationText, function (err) {
    if (err) {
      console.error(
        chalk`{redBright Error:} {yellowBright ${label} (${locale})} · {magentaBright ${resource}} → {gray ${err}}`
      )
    }

    console.log(
      chalk`{yellowBright ${label} (${locale})} · {magentaBright ${resource}} → {gray ${translationFile.replace(
        process.cwd(),
        '.'
      )}}`
    )
  })
}

const downloadError = function (locale, resource, label, error) {
  console.error(
    chalk`{redBright Error:} {yellowBright ${label} (${locale})} · {magentaBright ${resource}} → {gray ${error}}`
  )
}

for (const r in resources) {
  for (const l in languages) {
    // Skip English
    if (languages[l].value === 'en') {
      continue
    }

    getFromTransifex(
      languages[l].value,
      resources[r],
      process.env.TRANSIFEX_API_TOKEN
    )
      .then((data) => {
        downloadSuccess(
          languages[l].value,
          resources[r],
          languages[l].label,
          data
        )
      })
      .catch((error) => {
        downloadError(
          languages[l].value,
          resources[r],
          languages[l].label,
          error
        )
      })
  }
}
