import { AuthenticationClient, UserInfoClient } from 'auth0'

export const authClient = new AuthenticationClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET
})

export const userClient = new UserInfoClient({
  domain: process.env.AUTH0_DOMAIN
})
