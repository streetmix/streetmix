const routes = require('express').Router()
const bodyParser = require('body-parser')
const config = require('config')
const cors = require('cors')
const controllers = require('./controllers')
const resources = require('./resources')
const jwtCheck = require('./authentication')

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
routes.post('/services/pay', resources.services.payments.post)

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
routes.get('/services/geoip', resources.services.geoip.get)

routes.options('/services/images', cors())

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
routes.get('/services/images', cors(), jwtCheck, resources.services.images.get)

/******************************************************************************
 *  AUTHENTICATION SERVICES
 *****************************************************************************/

routes.post(
  '/services/auth/refresh-login-token',
  cors(),
  controllers.refresh_login_token.post
)

// Twitter (deprecated)
routes.get('/services/auth/twitter-sign-in', controllers.twitter_sign_in.get)
routes.get(
  config.twitter.oauth_callback_path,
  controllers.twitter_sign_in_callback.get
)
// Auth0
routes.get(config.auth0.callback_path, controllers.auth0_sign_in_callback.get)

// Callback route after signing in
// This is handled by front-end
routes.get('/services/auth/just-signed-in/', (req, res) => res.render('main'))

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
routes.post(
  '/services/csp-report',
  // As of this implementation, the latest versions of Chrome, Firefox, and
  // Safari all POST this content with the MIME type `application/csp-report`,
  // although it looks like a JSON. If any browser is still POSTing
  // `application/json`, Express should still be parsing that correctly, but
  // this has not been verified.
  bodyParser.json({ type: 'application/csp-report' }),
  resources.services.csp_report.post
)

// Catch all for all broken api paths, direct to 404 response.
routes.all('/services/*', (req, res) => {
  res
    .status(404)
    .json({ status: 404, error: 'Not found. Did you mispell something?' })
})

module.exports = routes
