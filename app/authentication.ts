import { expressjwt } from 'express-jwt'
import jwksRsa from 'jwks-rsa'

import type { NextFunction, Request, Response } from 'express'

// Types and type guards
type JwtErrorLike = {
  name?: string
  inner?: {
    name?: string
  }
}

function isJwtErrorLike(err: unknown): err is JwtErrorLike {
  return typeof err === 'object' && err !== null
}

function isUnauthorizedError(err: unknown): err is JwtErrorLike {
  return isJwtErrorLike(err) && err.name === 'UnauthorizedError'
}

function isExpiredTokenError(err: JwtErrorLike): boolean {
  return err.inner?.name === 'TokenExpiredError'
}

export function auth(credentialsRequired = true) {
  const middleware = expressjwt({
    algorithms: ['RS256'],
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    }),
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    audience: process.env.AUTH0_CLIENT_ID,
    credentialsRequired,
    getToken: function fromCookies(req) {
      if (req.cookies && req.cookies.login_token) {
        return req.cookies.login_token
      }
      return null
    },
  })

  return (req: Request, res: Response, next: NextFunction) => {
    // Error handling from the result of express-jwt.
    // If our token has expired, the `msg` will contain that information so that
    // the client can handle a token refresh, if necessary. Otherwise, send a
    // generic message.
    const handleErrorNext = (err?: unknown) => {
      if (!isUnauthorizedError(err)) {
        next(err)
        return
      }

      const message = isExpiredTokenError(err)
        ? 'Access token expired.'
        : 'Unauthorized request.'

      res.status(401).json({ status: 401, msg: message })
      return
    }

    return middleware(req, res, handleErrorNext)
  }
}
