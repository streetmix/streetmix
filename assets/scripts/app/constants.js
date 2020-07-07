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

export const DEFAULT_ANALYTICS_SOURCE = 'giz'

const CAPACITIES = {
  sidewalk: { average: 19000, potential: 19000 },
  'drive-lane': { average: 1500, potential: 2000 },
  'bike-lane': { average: 14000, potential: 14000 },
  scooter: { average: 14000, potential: 14000 },
  'light-rail': { average: 18000, potential: 20000 },
  streetcar: { average: 18000, potential: 20000 },
  'bus-lane': { average: 5000, potential: 8000 },
  'magic-carpet': { average: 2, potential: 3 }
}

const CAPACITIES_FOO = {
  sidewalk: { average: 1500, potential: 1500 },
  'drive-lane': { average: 1500, potential: 1500 },
  'bike-lane': { average: 1500, potential: 1500 },
  scooter: { average: 1500, potential: 1500 },
  'light-rail': { average: 1500, potential: 1500 },
  streetcar: { average: 18000, potential: 1500 },
  'bus-lane': { average: 5000, potential: 8000 },
  'magic-carpet': { average: 1500, potential: 1500 }
}

const CAPACITIES_BAR = {
  sidewalk: { average: 5000, potential: 5000 },
  'drive-lane': { average: 5000, potential: 5000 },
  'bike-lane': { average: 5000, potential: 5000 },
  scooter: { average: 5000, potential: 5000 },
  'light-rail': { average: 18000, potential: 18000 },
  streetcar: { average: 18000, potential: 20000 },
  'bus-lane': { average: 5000, potential: 8000 },
  'magic-carpet': { average: 2, potential: 3 }
}

export const SOURCE_LIST = [
  {
    label: 'Gesellschaft für Internationale Zusammenarbeit (GIZ)',
    value: 'giz',
    capacities: CAPACITIES,
    citationUrl:
      'http://www.uncrd.or.jp/content/documents/5594Presentation%203%20-%20Module%201%20-%20Mr.%20Breithaupt.pdf',
    citationLabel:
      'Environmentally Sustainable Transport - Main Principles and Impacts',
    citationSub:
      ', Manfred Breithaupt, Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ)'
  },
  {
    label: 'Foo Source',
    value: 'foo',
    capacities: CAPACITIES_FOO,
    citationUrl: 'http://google.com',
    citationLabel: 'Study of Foo in Public Spaces',
    citationSub: ', Some more text for Foo goes here'
  },
  {
    label: 'Bar Source',
    value: 'bar',
    capacities: CAPACITIES_BAR,
    citationUrl: 'http://streetmix.net',
    citationLabel: 'Study of Bar in Public Spaces',
    citationSub: ', Some more text for Bar goes here'
  }
]

export const SOURCE_VALUES = SOURCE_LIST.map((item) => item.value)
