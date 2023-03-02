import auth0 from 'auth0'

export const Authentication = function (scope) {
  return new auth0.AuthenticationClient({
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET
  })
}
