import { WebAuth } from 'auth0-js'
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from './config'

export default function (): WebAuth {
  return new WebAuth({
    domain: AUTH0_DOMAIN ?? '',
    clientID: AUTH0_CLIENT_ID ?? '',
    scope: 'openid profile screen_name offline_access email'
  })
}
