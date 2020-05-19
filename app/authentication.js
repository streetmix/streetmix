const jwt = require('express-jwt')
const config = require('config')
const jwksRsa = require('jwks-rsa')

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
  credentialsRequired: false
})

module.exports = jwtCheck
