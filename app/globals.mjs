// TODO: Refactor where we set these for ESM
process.title = 'streetmix'

// Set some defaults for env vars, if not set
// This must be set after `dotenv` loads
process.env.APP_DOMAIN = process.env.APP_DOMAIN || 'localhost'
process.env.APP_PROTOCOL =
  process.env.PROTOCOL || process.env.APP_DOMAIN === 'localhost'
    ? 'http'
    : 'https'
process.env.PORT = process.env.PORT || 8000
process.env.NODE_ENV = process.env.NODE_ENV || 'development'
