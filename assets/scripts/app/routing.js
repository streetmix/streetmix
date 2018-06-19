import { TWITTER_URL_SIGN_IN_CALLBACK_REL,
  AUTH0_TWITTER_URL_SIGN_IN_CALLBACK_REL,
  AUTH0_EMAIL_URL_SIGN_IN_CALLBACK_REL,
  AUTH0_FACEBOOK_URL_SIGN_IN_CALLBACK_REL,
  USE_AUTH0
} from './config'
import Authenticate from '../app/auth0'
// TODO replace the URLs in index.html dynamically
const URL_SIGN_IN = 'twitter-sign-in'

const TWITTER_URL_SIGN_IN_CALLBACK_ABS =
window.location.protocol + '//' + window.location.host + TWITTER_URL_SIGN_IN_CALLBACK_REL
const TWITTER_URL_SIGN_IN_CALLBACK = TWITTER_URL_SIGN_IN_CALLBACK_REL.replace(/^\//, '')

const AUTH0_TWITTER_URL_SIGN_IN_CALLBACK_ABS =
window.location.protocol + '//' + window.location.host + AUTH0_TWITTER_URL_SIGN_IN_CALLBACK_REL

const AUTH0_EMAIL_URL_SIGN_IN_CALLBACK_ABS =
window.location.protocol + '//' + window.location.host + AUTH0_EMAIL_URL_SIGN_IN_CALLBACK_REL

const AUTH0_FACEBOOK_URL_SIGN_IN_CALLBACK_ABS =
window.location.protocol + '//' + window.location.host + AUTH0_FACEBOOK_URL_SIGN_IN_CALLBACK_REL

const URL_JUST_SIGNED_IN_REL = '/just-signed-in'
const URL_JUST_SIGNED_IN_ABS =
window.location.protocol + '//' + window.location.host + URL_JUST_SIGNED_IN_REL

// const URL_JUST_SIGNED_IN = URL_JUST_SIGNED_IN_REL.replace(/^\//, '')
export const URL_JUST_SIGNED_IN = 'just-signed-in' // TODO fix this
export const URL_NEW_STREET = 'new'
export const URL_NEW_STREET_COPY_LAST = 'copy-last'
export const URL_GLOBAL_GALLERY = 'gallery'
export const URL_ERROR = 'error'
export const URL_NO_USER = '-'
export const URL_HELP = 'help'

export const URL_ERROR_TWITTER_ACCESS_DENIED = 'twitter-access-denied'
export const URL_ERROR_EMAIL_ACCESS_DENIED = 'email-access-denied'
export const URL_ERROR_NO_TWITTER_REQUEST_TOKEN = 'no-twitter-request-token'
export const URL_ERROR_NO_TWITTER_ACCESS_TOKEN = 'no-twitter-access-token'
export const URL_ERROR_NO_EMAIL_ACCESS_TOKEN = 'no-email-access-token'
export const URL_ERROR_AUTHENTICATION_API_PROBLEM = 'authentication-api-problem'

const URL_EXAMPLE_STREET = 'streetmix/7'

export const TWITTER_URL_SIGN_IN_REDIRECT = URL_SIGN_IN + '?callbackUri=' +
  TWITTER_URL_SIGN_IN_CALLBACK_ABS + '&redirectUri=' + URL_JUST_SIGNED_IN_ABS

export const AUTH0_TWITTER_CALLBACK_URL = AUTH0_TWITTER_URL_SIGN_IN_CALLBACK_ABS
export const AUTH0_EMAIL_CALLBACK_URL = AUTH0_EMAIL_URL_SIGN_IN_CALLBACK_ABS
export const AUTH0_FACEBOOK_CALLBACK_URL = AUTH0_FACEBOOK_URL_SIGN_IN_CALLBACK_ABS

// Since URLs like “streetmix.net/new” are reserved, but we still want
// @new to be able to use Streetmix, we prefix any reserved URLs with ~
export const RESERVED_URLS = [
  URL_SIGN_IN, TWITTER_URL_SIGN_IN_CALLBACK,
  URL_NEW_STREET, URL_NEW_STREET_COPY_LAST,
  URL_JUST_SIGNED_IN,
  URL_HELP, URL_GLOBAL_GALLERY, URL_ERROR, 'streets'
]
export const URL_RESERVED_PREFIX = '~'

export function goReload () {
  window.location.reload()
}

export function goHome () {
  window.location.href = '/'
}

export function goNewStreet (sameWindow) {
  if (sameWindow) {
    window.location.replace('/' + URL_NEW_STREET)
  } else {
    window.location.href = '/' + URL_NEW_STREET
  }
}

export function goExampleStreet () {
  window.location.href = '/' + URL_EXAMPLE_STREET
}

// NOTE: This does not seem to be used anywhere
export function goCopyLastStreet () {
  window.location.href = '/' + URL_NEW_STREET_COPY_LAST
}

export function goTwitterSignIn () {
  const auth0 = Authenticate()
  if (USE_AUTH0) {
    auth0.authorize({
      responseType: 'code',
      connection: 'twitter',
      redirectUri: AUTH0_TWITTER_CALLBACK_URL
    })
  } else {
    window.location.href = '/' + TWITTER_URL_SIGN_IN_REDIRECT
  }
}

export function goFacebookSignIn () {
  const auth0 = Authenticate()
  auth0.authorize({
    responseType: 'code',
    connection: 'facebook',
    redirectUri: AUTH0_FACEBOOK_CALLBACK_URL
  })
}

export function goEmailSignIn (email, callback) {
  const auth0 = Authenticate()
  auth0.passwordlessStart({
    send: 'link',
    email: email,
    connection: 'email',
    authParams: {
      redirectUri: AUTH0_EMAIL_CALLBACK_URL,
      responseType: 'code'
    }
  }, (err, res) => {
    callback(err, res)
  })
}
