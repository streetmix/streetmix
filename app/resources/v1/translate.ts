import * as fs from 'node:fs/promises'
import { getFromTransifex } from '@streetmix/i18n'

import { logger } from '../../lib/logger.ts'

import type { Request, Response } from 'express'
import type { TranslationRecord } from '@streetmix/types'

async function getLocalTranslation(
  res: Response,
  locale: string,
  resource: string
): Promise<TranslationRecord> {
  const translationFile =
    process.cwd() +
    '/packages/i18n/locales/' +
    locale +
    '/' +
    resource +
    '.json'

  let contents
  try {
    const file = await fs.readFile(translationFile, 'utf8')
    contents = JSON.parse(file)
  } catch (err) {
    logger.error(err)

    if (err.code === 'ENOENT') {
      res.status(404).json({
        status: 404,
        msg: 'No translation found with locale code: ' + locale,
      })
    } else {
      res.status(500).json({
        status: 500,
        msg: 'Could not retrieve translation for locale: ' + locale,
      })
    }
  }

  return contents
}

function sendSuccessResponse(
  res: Response,
  locale: string,
  resource: string,
  translation: TranslationRecord
) {
  res.set({
    'Content-Type': 'application/json; charset=utf-8',
    Location: '/api/v1/translate/' + locale + '/' + resource,
    'Cache-Control': 'max-age=86400',
  })

  res.status(200).json(translation)
}

export async function get(req: Request, res: Response) {
  const locale = req.params.locale_code
  const resource = req.params.resource_name

  if (!locale || !resource) {
    res.status(400).json({ status: 400, msg: 'Please provide locale code.' })
    return
  }

  let translation

  try {
    // Transifex v3 won't return the English source language via the
    // download API. For English, use local resources.
    if (
      typeof process.env.TRANSIFEX_API_TOKEN === 'undefined' ||
      locale === 'en'
    ) {
      translation = await getLocalTranslation(res, locale, resource)
    } else {
      // TODO: Fall back to local translation if remote resource fails
      translation = await getFromTransifex(
        locale,
        resource,
        process.env.TRANSIFEX_API_TOKEN
      )
    }
  } catch (err) {
    logger.error(err)

    res.status(500).json({
      status: 500,
      msg: 'Could not retrieve translation for locale: ' + locale,
    })
    return
  }

  if (translation) {
    sendSuccessResponse(res, locale, resource, translation)
  }
}
