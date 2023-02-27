import axios from 'axios'
import { transifexApi } from '@transifex/api'
import logger from './logger.js'

const ORGANIZATION_SLUG = 'streetmix'
const PROJECT_SLUG = 'streetmix'
const ERROR_MESSAGE =
  'Please provide a Transifex API token to use translation feature.'

export async function getFromTransifex (locale, resourceSlug, token) {
  if (!token) {
    logger.error(ERROR_MESSAGE)
    return Promise.reject(new Error(ERROR_MESSAGE))
  }

  // Initialize the Transifex client library
  transifexApi.setup({ auth: token })

  // Locales in Transifex are formatted as `xx_YY` with an underscore in most
  // cases, except for Chinese, so we replace dashes with underscores
  if (!locale.startsWith('zh-')) {
    locale = locale.replace('-', '_')
  }

  // Get organization
  const organization = await transifexApi.Organization.get({
    slug: ORGANIZATION_SLUG
  })

  // Get projects for the organization
  const projects = await organization.fetch('projects')

  // We only have one project, so get that one
  const project = await projects.get({ slug: PROJECT_SLUG })

  // Get resources - instead of using the list from the API, we pass resource
  // slugs to this function
  const resources = await project.fetch('resources')
  const resource = await resources.get({ slug: resourceSlug })

  // Get language - intead of using the list from the API, we pass the locale
  // code to this function
  const language = await transifexApi.Language.get({ code: locale })

  // Set up download. This is a two stage process: the resource download is
  // first requested from Transifex, then downloaded when ready
  const url = await transifexApi.ResourceTranslationsAsyncDownload.download({
    mode: 'onlytranslated',
    resource,
    language
  })
  const response = await axios.get(url)

  // Return data as JavaScript object
  return response.data
}
