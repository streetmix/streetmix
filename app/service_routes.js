import { Router } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import * as controllers from './controllers/index.js'
import * as services from './resources/services/index.ts'
import jwtCheck from './authentication.js'

// Base path of router is `/services` (see app.js)
const router = Router()

/**
 * @swagger
 *
 * /services/changelog:
 *   post:
 *     description: Gets changelog in Markdown
 *     produces:
 *       - text/plain
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/changelog', services.changelog.get)

/**
 * @swagger
 *
 * /services/pay:
 *   post:
 *     description: Creates a payment for a streetmix subscription
 *     tags:
 *       - payment
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: street
 *         description: Street object
 *         in: body
 *         required: true
 *         type: string
 *         schema:
 *           $ref: '#/definitions/NewSubscription'
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/pay', services.payments.post)

/**
 * @swagger
 * /services/geoip:
 *   get:
 *     description: Returns geolocation data for the current user
 *     tags:
 *       - geolocation
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Geolocation data
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/GeolocationResponse'
 */
router.get('/geoip', services.geoip.get)

router.options('/images', cors())

/**
 * @swagger
 * /services/images:
 *   get:
 *     description: Returns a token to get images for the user
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     tags:
 *       - images
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Cloudinary API key and metadata
 *         schema:
 *           type: object
 *           properties:
 *             signature:
 *               type: string
 *             timestamp:
 *               type: string
 *             api_key:
 *               type: string
 */
router.get('/images', cors(), jwtCheck, services.images.get)

/******************************************************************************
 *  AUTHENTICATION SERVICES
 *****************************************************************************/

router.post(
  '/auth/refresh-login-token',
  cors(),
  controllers.refreshLoginToken.post
)

// Auth0
router.get('/auth/sign-in-callback', controllers.auth0SignInCallback.get)

// Callback route after signing in
// This is handled by front-end
router.get('/auth/just-signed-in/', (req, res) => res.render('main'))

/******************************************************************************
 *  THIRD PARTY APP INTEGRATIONS
 *****************************************************************************/

router.get('/integrations/patreon', jwtCheck, services.integrations.patreon.get)
router.get(
  '/integrations/patreon/callback',
  services.integrations.patreon.callback,
  services.integrations.patreon.connectUser
)
router.post(
  '/integrations/patreon/webhook',
  services.integrations.patreon.webhook
)

// Redirect the user to the OAuth 2.0 provider for authentication.
router.get('/integrations/coil', jwtCheck, services.integrations.coil.get)

// The OAuth 2.0 provider has redirected the user back to the application.
// Finish the authentication process by attempting to obtain an access
// token.
// If authorization was granted, the user's account data will be updated
// and a BTP token will be issued

router.get(
  '/integrations/coil/callback',
  services.integrations.coil.callback,
  services.integrations.coil.connectUser
)

/******************************************************************************
 *  ERROR HANDLING
 *****************************************************************************/

/**
 * @swagger
 *
 * /services/csp-report:
 *   post:
 *     description: Receives a Content Security Policy violation report
 *     responses:
 *       204:
 *         description: Success (no response)
 */
router.post(
  '/csp-report',
  // As of this implementation, the latest versions of Chrome, Firefox, and
  // Safari all POST this content with the MIME type `application/csp-report`,
  // although it looks like a JSON. If any browser is still POSTing
  // `application/json`, Express should still be parsing that correctly, but
  // this has not been verified.
  bodyParser.json({ type: 'application/csp-report' }),
  services.cspReport.post
)

// Catch all for all broken api paths, direct to 404 response.
router.all(/.*/, (req, res) => {
  res
    .status(404)
    .json({ status: 404, error: 'Not found. Did you mispell something?' })
})

export default router
