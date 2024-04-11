import * as fs from 'node:fs/promises'
import chalk from 'chalk'
import { getFromTransifex } from '../../app/lib/transifex.js'

const languages = JSON.parse(
  await fs.readFile(new URL('./locales.json', import.meta.url))
)

const resources = ['main', 'segment-info']

if (!process.env.TRANSIFEX_API_TOKEN) {
  console.error('Error: please provide a Transifex API token.')
  process.exit()
}

const downloadSuccess = async function (locale, resource, label, data) {
  const localePath = `./locales/${locale}`
  const translationFile = new URL(
    `${localePath}/${resource}.json`,
    import.meta.url
  )

  // Add trailing newline at end of file
  const translationText = JSON.stringify(data, null, 2) + '\n'

  // Create the folder path, if it doesn't already exist
  try {
    const projectFolder = new URL(localePath, import.meta.url)
    const createDir = await fs.mkdir(projectFolder, { recursive: true })

    // createDir is undefined if the folder already exists.
    if (createDir) {
      console.info('Created folder:', chalk.magentaBright(createDir))
    }
  } catch (err) {
    console.error(err.message)
  }

  // Write translation files
  try {
    await fs.writeFile(translationFile, translationText)
  } catch (err) {
    console.error(
      chalk.redBright('Error:'),
      chalk.yellowBright(`${label} (${locale})`),
      '·',
      chalk.magentaBright(resource),
      '→',
      chalk.gray(err)
    )
  }

  console.log(
    'Downloaded:',
    chalk.yellowBright(`${label} (${locale})`),
    '·',
    chalk.magentaBright(resource),
    '→',
    chalk.gray(translationFile.href.replace(`file://${process.cwd()}`, '.'))
  )
}

const downloadError = function (locale, resource, label, error) {
  console.error(
    chalk.redBright('Error:'),
    chalk.yellowBright(`${label} (${locale})}`),
    '·',
    chalk.magentaBright(resource),
    '→',
    chalk.gray(error)
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
      'Queued:',
      chalk.yellowBright(`${label} (${locale})`),
      '·',
      chalk.magentaBright(resource)
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
