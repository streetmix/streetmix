const config = require('config')
const { AuthenticationClient, ManagementClient } = require('auth0')

exports.Authentication = function (scope) {
  return new AuthenticationClient({
    domain: config.auth0.domain,
    clientId: config.auth0.client_id,
    clientSecret: config.auth0.client_secret
  })
}

exports.Management = function () {
  return new ManagementClient({
    clientId: config.auth0.client_id,
    clientSecret: config.auth0.client_secret,
    domain: config.auth0.domain,
    audience: config.auth0.audience,
    tokenProvider: {
      enableCache: true,
      cacheTTLInSeconds: 10
    }
  })
}
