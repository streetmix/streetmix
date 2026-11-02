import { AuthClient } from '@auth0/auth0-auth-js'

export const authClient = new AuthClient({
  domain: process.env.AUTH0_DOMAIN ?? '',
  clientId: process.env.AUTH0_CLIENT_ID ?? '',
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
})
