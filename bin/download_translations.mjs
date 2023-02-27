import * as fs from 'node:fs/promises'
import chalk from 'chalk'
import mkdirp from 'mkdirp'
import { getFromTransifex } from '../app/lib/transifex.mjs'

const languages = JSON.parse(
  await fs.readFile(new URL('../app/data/locales.json', import.meta.url))
)

const resources = ['main', 'segment-info']

if (!process.env.TRANSIFEX_API_TOKEN) {
  console.error('Error: please provide a Transifex API token.')
  process.exit()
}

const downloadSuccess = async function (locale, resource, label, data) {
  const localePath = `../assets/locales/${locale}`
  const translationFile = new URL(
    `${localePath}/${resource}.json`,
    import.meta.url
  )

  // Add trailing newline at end of file
  const translationText = JSON.stringify(data, null, 2) + '\n'

  mkdirp.sync(localePath)

  try {
    await fs.writeFile(translationFile, translationText)
  } catch (err) {
    console.error(
      chalk`{redBright Error:} {yellowBright ${label} (${locale})} · {magentaBright ${resource}} → {gray ${err}}`
    )
  }

  console.log(
    chalk`Downloaded: {yellowBright ${label} (${locale})} · {magentaBright ${resource}} → {gray ${translationFile.href.replace(
      `file://${process.cwd()}`,
      '.'
    )}}`
  )
}

const downloadError = function (locale, resource, label, error) {
  console.error(
    chalk`{redBright Error:} {yellowBright ${label} (${locale})} · {magentaBright ${resource}} → {gray ${error}}`
  )
}

for (const l in languages) {
  const locale = languages[l].value
  const label = languages[l].label

  // Skip English
  if (languages[l].value === 'en') {
    continue
  }

  for (const r in resources) {
    const resource = resources[r]

    console.log(
      chalk`Queued: {yellowBright ${label} (${locale})} · {magentaBright ${resource}}`
    )

    getFromTransifex(locale, resource, process.env.TRANSIFEX_API_TOKEN)
      .then((data) => {
        downloadSuccess(locale, resource, label, data)
      })
      .catch((error) => {
        downloadError(locale, resource, label, error)
      })
  }
}
