import {
  TWITTER_SIGN_IN_CALLBACK_PATH,
  AUTH0_SIGN_IN_CALLBACK_PATH
} from './config'

export const TWITTER_SIGN_IN_CALLBACK_URL = new URL(
  TWITTER_SIGN_IN_CALLBACK_PATH,
  window.location.origin
).href

export const AUTH0_SIGN_IN_CALLBACK_URL = new URL(
  AUTH0_SIGN_IN_CALLBACK_PATH,
  window.location.origin
).href

export const JUST_SIGNED_IN_PATH = 'just-signed-in'
export const JUST_SIGNED_IN_URL = new URL(
  JUST_SIGNED_IN_PATH,
  window.location.origin
).href

export const TWITTER_SIGN_IN_PATH = 'twitter-sign-in'
export const TWITTER_URL_SIGN_IN_REDIRECT =
  TWITTER_SIGN_IN_PATH +
  '?callbackUri=' +
  TWITTER_SIGN_IN_CALLBACK_URL +
  '&redirectUri=' +
  JUST_SIGNED_IN_URL

// Path segments
export const URL_NEW_STREET = 'new'
export const URL_NEW_STREET_COPY_LAST = 'copy-last'
export const URL_GLOBAL_GALLERY = 'gallery'
export const URL_ERROR = 'error'
export const URL_NO_USER = '-'
export const URL_HELP = 'help'

export const URL_ERROR_ACCESS_DENIED = 'access-denied'
export const URL_ERROR_NO_ACCESS_TOKEN = 'no-access-token'

export const URL_ERROR_NO_TWITTER_REQUEST_TOKEN = 'no-twitter-request-token'
export const URL_ERROR_NO_TWITTER_ACCESS_TOKEN = 'no-twitter-access-token'
export const URL_ERROR_AUTHENTICATION_API_PROBLEM = 'authentication-api-problem'

export const URL_EXAMPLE_STREET = 'streetmix/7'

// Since URLs like “streetmix.net/new” are reserved, but we still want
// @new to be able to use Streetmix, we prefix any reserved URLs with ~
export const RESERVED_URLS = [
  TWITTER_SIGN_IN_PATH,
  TWITTER_SIGN_IN_CALLBACK_PATH,
  AUTH0_SIGN_IN_CALLBACK_PATH,
  JUST_SIGNED_IN_PATH,
  URL_NEW_STREET,
  URL_NEW_STREET_COPY_LAST,
  URL_HELP,
  URL_GLOBAL_GALLERY,
  URL_ERROR,
  'streets',
  'terms-of-service',
  'privacy-policy',
  'map',
  'survey'
]

export const URL_RESERVED_PREFIX = '~'

export const MAX_COMMENT_LENGTH = 280
