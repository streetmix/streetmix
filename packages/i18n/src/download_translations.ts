import * as fs from 'node:fs/promises'
import { styleText } from 'node:util'

import { LOCALES, LOCALE_LEVELS, type LocaleDefinition } from './locales.js'
import { getFromTransifex } from './transifex.js'

const resources = ['main', 'segment-info']

// Check for Transifex API token in environment. It will be undefined if it is
// not in the environment, and an empty string if it is present but not set
const { TRANSIFEX_API_TOKEN } = process.env
if (TRANSIFEX_API_TOKEN === undefined || TRANSIFEX_API_TOKEN === '') {
  console.error('Error: please provide a Transifex API token.')
  process.exit()
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === 'object' && error !== null && 'message' in error
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
  const translationText =
    JSON.stringify(data, null, LOCALE_LEVELS.LEVEL_2) + '\n'

  // Create the folder path, if it doesn't already exist
  try {
    const projectFolder = new URL(localePath, import.meta.url)
    const createdDir = await fs.mkdir(projectFolder, { recursive: true })

    // `createdDir` is undefined if the folder already exists.
    if (createdDir !== undefined) {
      console.info('Created folder:', styleText('magenta', createdDir))
    }
  } catch (err) {
    // @ts-expect-error no type for `err`
    console.error(err.message)
  }

  // Write translation files
  try {
    await fs.writeFile(translationFile, translationText)
  } catch (err) {
    let message = ''
    if (isNodeError(err)) {
      message = err.message
    } else {
      message = err as string
    }

    console.error(
      styleText(['red', 'bold'], 'Error:'),
      styleText('yellow', `${label} (${locale})`),
      '·',
      styleText('magenta', resource),
      '→',
      styleText('gray', message)
    )
  }

  console.log(
    'Downloaded:',
    styleText('yellow', `${label} (${locale})`),
    '·',
    styleText('magenta', resource),
    '→',
    styleText(
      'gray',
      translationFile.href.replace(`file://${process.cwd()}`, '.')
    )
  )
}

const downloadError = function (
  locale: string,
  resource: string,
  label: string,
  error: string
): void {
  console.error(
    styleText(['red', 'bold'], 'Error:'),
    styleText('yellow', `${label} (${locale})`),
    '·',
    styleText('magenta', resource),
    '→',
    styleText('gray', error)
  )
}

LOCALES.forEach((language: LocaleDefinition) => {
  const { value, label } = language

  // Skip US English (default language)
  if (value === 'en') {
    return
  }

  resources.forEach(async (resource) => {
    console.log(
      'Queued:',
      styleText('yellow', `${label} (${value})`),
      '·',
      styleText('magenta', resource)
    )

    try {
      const data = await getFromTransifex(
        value,
        resource,
        process.env.TRANSIFEX_API_TOKEN
      )
      downloadSuccess(value, resource, label, data)
    } catch (error) {
      let message = ''
      if (isNodeError(error)) {
        message = error.message
      } else {
        message = error as string
      }

      downloadError(value, resource, label, message)
    }
  })
})
