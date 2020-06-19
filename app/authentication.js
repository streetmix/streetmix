const jwt = require('express-jwt')
const config = require('config')
const jwksRsa = require('jwks-rsa')
const logger = require('../lib/logger.js')()

const secret = jwksRsa.expressJwtSecret({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksUri: 'http://streetmix.auth0.com/.well-known/jwks.json'
})

const jwtCheck = jwt({
  algorithms: ['RS256'],
  secret,
  issuer: 'https://streetmix.auth0.com/',
  audience: config.auth0.client_id,
  credentialsRequired: false,
  getToken: function fromCookies (req) {
    if (req.cookies && req.cookies.login_token) {
      return req.cookies.login_token
    }
    return null
  }
})

const wrappedCheck = (req, res, next) => {
  const handleErrorNext = (err) => {
    if (err) {
      if (
        err.name === 'UnauthorizedError' &&
        err.inner.name === 'TokenExpiredError'
      ) {
        logger.error(err)
        console.log('TOKEN EXPIRED', err)
        return next()
      }
    }
    next(err)
  }

  jwtCheck(req, res, handleErrorNext)
}

module.exports = wrappedCheck
