import { expressjwt } from 'express-jwt'
import jwksRsa from 'jwks-rsa'
import logger from './lib/logger.js'

const secret = jwksRsa.expressJwtSecret({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
})

const jwtCheck = expressjwt({
  algorithms: ['RS256'],
  secret,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  audience: process.env.AUTH0_CLIENT_ID,
  credentialsRequired: false,
  getToken: function fromCookies (req) {
    if (req.cookies && req.cookies.login_token) {
      return req.cookies.login_token
    }
    return null
  }
})

export default function wrappedCheck (req, res, next) {
  const handleErrorNext = (err) => {
    if (
      err?.name === 'UnauthorizedError' &&
      err?.inner.name === 'TokenExpiredError' &&
      (req.method === 'POST' || req.method === 'PUT')
    ) {
      logger.error(
        `Expired token sent for authenticated route - ${req.method} ${req.url}`
      )
      logger.error(err)
    }
    next(err)
  }

  return jwtCheck(req, res, handleErrorNext)
}
