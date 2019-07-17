import {
  URL_NEW_STREET,
  URL_EXAMPLE_STREET,
  URL_NEW_STREET_COPY_LAST,
  AUTH0_SIGN_IN_CALLBACK_URL,
  TWITTER_URL_SIGN_IN_REDIRECT
} from './constants'
import { USE_AUTH0 } from './config'
import Authenticate from './auth0'

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
      redirectUri: AUTH0_SIGN_IN_CALLBACK_URL
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
    redirectUri: AUTH0_SIGN_IN_CALLBACK_URL
  })
}

export function goGoogleSignIn () {
  const auth0 = Authenticate()
  auth0.authorize({
    responseType: 'code',
    connection: 'google-oauth2',
    redirectUri: AUTH0_SIGN_IN_CALLBACK_URL
  })
}

export function goEmailSignIn (email, callback) {
  const auth0 = Authenticate()
  auth0.passwordlessStart({
    send: 'link',
    email: email,
    connection: 'email',
    authParams: {
      redirectUri: AUTH0_SIGN_IN_CALLBACK_URL,
      responseType: 'code'
    }
  }, (err, res) => {
    callback(err, res)
  })
}
