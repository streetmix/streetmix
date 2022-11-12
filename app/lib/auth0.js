const { AuthenticationClient } = require('auth0')

exports.Authentication = function (scope) {
  return new AuthenticationClient({
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET
  })
}
