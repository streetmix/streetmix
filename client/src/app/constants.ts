export const JUST_SIGNED_IN_PATH = '/services/auth/just-signed-in'

// New street template params
export const STREET_TEMPLATES = {
  DEFAULT: 'default',
  EMPTY: 'empty',
  COPY: 'copy',
  HARBORWALK: 'harborwalk',
  COASTAL_ROAD: 'coastal_road',
  BEACH: 'beach',
  STROAD: 'stroad',
}

// Path segments
export const URL_NEW_STREET = '/new'
export const URL_GLOBAL_GALLERY = '/gallery'
export const URL_ERROR = '/error'
export const URL_SURVEY_FINISHED = '/survey-finished'

// Since URLs like “streetmix.net/new” are reserved, but we still want
// @new to be able to use Streetmix, we prefix any reserved URLs with ~
export const RESERVED_URLS = [
  '/services',
  URL_NEW_STREET,
  URL_GLOBAL_GALLERY,
  URL_ERROR,
  '/help',
  URL_SURVEY_FINISHED,
  '/streets',
  '/terms-of-service',
  '/privacy-policy',
  '/map',
  '/survey',
]

export const URL_RESERVED_PREFIX = '~'

// Color modes
export const COLOR_MODE_LIGHT = 'light'
export const COLOR_MODE_DARK = 'dark'
export const COLOR_MODE_AUTO = 'auto'

export type ColorModes = 'light' | 'dark' | 'auto'
