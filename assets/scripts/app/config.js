/**
 * Environment variables are passed in as strings. This means falsy values are
 * implicitly converted to strings, which become truthy as a result.
 *
 * This function parses incoming variables and unconverts them, if necessary.
 *
 * @param {string} value
 * @return mixed types
 */
function parse (value) {
  switch (value) {
    case 'null':
      return null
    case 'undefined':
      return undefined
    case 'false':
      return false
    case 'true':
      return true
    default:
      return value
  }
}

export const API_URL = process.env.API_URL + '/'
export const FACEBOOK_APP_ID = parse(process.env.FACEBOOK_APP_ID)
export const ENV = process.env.ENV
export const OFFLINE_MODE = parse(process.env.OFFLINE_MODE)
export const PELIAS_API_KEY = parse(process.env.PELIAS_API_KEY)
export const PELIAS_HOST_NAME = parse(process.env.PELIAS_HOST_NAME)
export const AUTH0_CLIENT_ID = parse(process.env.AUTH0_CLIENT_ID)
export const AUTH0_DOMAIN = parse(process.env.AUTH0_DOMAIN)
export const AUTH0_SIGN_IN_CALLBACK_PATH = parse(
  process.env.AUTH0_CALLBACK_PATH
)
export const STRIPE_PUBLIC_KEY = parse(process.env.STRIPE_PUBLIC_KEY)
