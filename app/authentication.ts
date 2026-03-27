import { expressjwt } from 'express-jwt'
import jwksRsa from 'jwks-rsa'

import { logger } from './lib/logger.ts'

import type { NextFunction, Request, Response } from 'express'

const secret = jwksRsa.expressJwtSecret({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
})

const origJwtCheck = expressjwt({
  algorithms: ['RS256'],
  secret,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  audience: process.env.AUTH0_CLIENT_ID,
  credentialsRequired: false,
  getToken: function fromCookies(req) {
    if (req.cookies && req.cookies.login_token) {
      return req.cookies.login_token
    }
    return null
  },
})

export function jwtCheck(req: Request, res: Response, next: NextFunction) {
  const handleErrorNext = (err?: unknown) => {
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

  return origJwtCheck(req, res, handleErrorNext)
}
