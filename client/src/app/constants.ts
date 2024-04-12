export const JUST_SIGNED_IN_PATH = '/services/auth/just-signed-in'

// Path segments
export const URL_NEW_STREET = '/new'
export const URL_NEW_STREET_COPY_LAST = '/copy-last'
export const URL_GLOBAL_GALLERY = '/gallery'
export const URL_ERROR = '/error'
export const URL_HELP = '/help'
export const URL_SURVEY_FINISHED = '/survey-finished'

// Error fragments that occur after /error/
export const URL_ERROR_NO_TWITTER_REQUEST_TOKEN = 'no-twitter-request-token'
export const URL_ERROR_NO_TWITTER_ACCESS_TOKEN = 'no-twitter-access-token'
export const URL_ERROR_NO_ACCESS_TOKEN = 'no-access-token'
export const URL_ERROR_AUTHENTICATION_API_PROBLEM = 'authentication-api-problem'
export const URL_ERROR_ACCESS_DENIED = 'access-denied'

export const URL_EXAMPLE_STREET = '/streetmix/7'

// Since URLs like “streetmix.net/new” are reserved, but we still want
// @new to be able to use Streetmix, we prefix any reserved URLs with ~
export const RESERVED_URLS = [
  '/services',
  URL_NEW_STREET,
  URL_NEW_STREET_COPY_LAST,
  URL_GLOBAL_GALLERY,
  URL_ERROR,
  URL_HELP,
  URL_SURVEY_FINISHED,
  '/streets',
  '/terms-of-service',
  '/privacy-policy',
  '/map',
  '/survey'
]

export const URL_RESERVED_PREFIX = '~'

// Color modes
export const COLOR_MODE_LIGHT = 'light'
export const COLOR_MODE_DARK = 'dark'
export const COLOR_MODE_AUTO = 'auto'

export type ColorModes = 'light' | 'dark' | 'auto'
