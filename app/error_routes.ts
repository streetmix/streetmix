import { Router } from 'express'

// Base path of router is `/error` (see app.js)
const errorRoutes = Router()

// This re-implements an old strategy of routing authentication errors to a
// URL that is handled by the client-side bundle, because it's better to
// serve these errors from the back-end anyway. With that in mind, the server
// is perfectly capable of displaying errors without using specific URLs.
// For now, we keep the URLs, but in the future revisit this and remove
// URLs if necessary.

errorRoutes.get('/access-denied', (req, res, next) => {
  next({ status: 401 })
})

errorRoutes.get('/authentication-api-problem', (req, res, next) => {
  next({ status: 503 })
})

errorRoutes.get('/no-access-token', (req, res, next) => {
  next({ status: 503 })
})

errorRoutes.get('/no-twitter-access-token', (req, res, next) => {
  next({ status: 503 })
})

errorRoutes.get('/no-twitter-request-token', (req, res, next) => {
  next({ status: 503 })
})

// Catch all for all other subpaths
errorRoutes.get(/.*/, (req, res, next) => {
  next({ status: 404 })
})

export default errorRoutes
