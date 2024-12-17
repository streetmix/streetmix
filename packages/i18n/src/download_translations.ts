import * as fs from 'node:fs/promises'
import chalk from 'chalk'

import LOCALES, { type LocaleDefinition } from './locales.js'
import { getFromTransifex } from './transifex.js'

const resources = ['main', 'segment-info']

// Check for Transifex API token in environment. It will be undefined if it is
// not in the environment, and an empty string if it is present but not set
const envToken = process.env.TRANSIFEX_API_TOKEN
if (envToken === undefined || envToken === '') {
  console.error('Error: please provide a Transifex API token.')
  process.exit()
}

const downloadSuccess = async function (
  locale: string,
  resource: string,
  label: string,
  data: unknown
): Promise<void> {
  const localePath = `../locales/${locale}`
  const translationFile = new URL(
    `${localePath}/${resource}.json`,
    import.meta.url
  )

  // Add trailing newline at end of file
  const translationText = JSON.stringify(data, null, 2) + '\n'

  // Create the folder path, if it doesn't already exist
  try {
    const projectFolder = new URL(localePath, import.meta.url)
    const createdDir = await fs.mkdir(projectFolder, { recursive: true })

    // `createdDir` is undefined if the folder already exists.
    if (createdDir !== undefined) {
      console.info('Created folder:', chalk.magentaBright(createdDir))
    }
  } catch (err) {
    // @ts-expect-error no type for `err`
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

const downloadError = function (
  locale: string,
  resource: string,
  label: string,
  error: unknown
): void {
  console.error(
    chalk.redBright('Error:'),
    chalk.yellowBright(`${label} (${locale})}`),
    '·',
    chalk.magentaBright(resource),
    '→',
    chalk.gray(error)
  )
}

LOCALES.forEach((language: LocaleDefinition) => {
  const locale = language.value
  const label = language.label

  // Skip US English (default language)
  if (language.value === 'en') {
    return
  }

  resources.forEach((resource) => {
    console.log(
      'Queued:',
      chalk.yellowBright(`${label} (${locale})`),
      '·',
      chalk.magentaBright(resource)
    )

    getFromTransifex(locale, resource, process.env.TRANSIFEX_API_TOKEN)
      .then(async (data) => {
        await downloadSuccess(locale, resource, label, data)
      })
      .catch((error) => {
        downloadError(locale, resource, label, error)
      })
  })
})
