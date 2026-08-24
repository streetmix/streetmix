import { URL_NEW_STREET } from './constants.js'
import Authenticate from './auth0.js'

import type { Auth0Error } from 'auth0-js'

const AUTH0_SIGN_IN_CALLBACK_URL = new URL(
  '/services/auth0/sign-in-callback',
  window.location.origin
).href

export function goReload(): void {
  window.location.reload()
}

export function goHome(): void {
  window.location.href = '/'
}

export function goNewStreet(sameWindow?: boolean): void {
  if (sameWindow) {
    window.location.replace(URL_NEW_STREET)
  } else {
    window.location.href = URL_NEW_STREET
  }
}

export function goTwitterSignIn(): void {
  const auth0 = Authenticate()
  auth0.authorize({
    responseType: 'code',
    connection: 'twitter',
    redirectUri: AUTH0_SIGN_IN_CALLBACK_URL,
  })
}

export function goFacebookSignIn(): void {
  const auth0 = Authenticate()
  auth0.authorize({
    responseType: 'code',
    connection: 'facebook',
    redirectUri: AUTH0_SIGN_IN_CALLBACK_URL,
  })
}

export function goGoogleSignIn(): void {
  const auth0 = Authenticate()
  auth0.authorize({
    responseType: 'code',
    connection: 'google-oauth2',
    redirectUri: AUTH0_SIGN_IN_CALLBACK_URL,
  })
}

export function goEmailSignIn(
  email: string,
  callback: (err: Auth0Error | null, res?: unknown) => void
): void {
  const auth0 = Authenticate()
  auth0.passwordlessStart(
    {
      send: 'link',
      email,
      connection: 'email',
      authParams: {
        redirectUri: AUTH0_SIGN_IN_CALLBACK_URL,
        responseType: 'code',
      },
    },
    (err, res) => {
      callback(err, res)
    }
  )
}
