const routes = require('express').Router()
const cors = require('cors')
const resources = require('./resources')
const jwtCheck = require('./authentication')

/**
 * @swagger
 *
 * definitions:
 *   NewSubscription:
 *     type: object
 *     properties:
 *       userId:
 *         type: string
 *       token:
 *         type: object
 *         properties:
 *           email:
 *             type: string
 *           id:
 *             type: string
 *   Vote:
 *     type: object
 *     properties:
 *       streetId:
 *         type: string
 *       score:
 *         type: string
 */

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
 *         in:  body
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
 *      - application/json
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
 *      - application/json
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

/**
 * @swagger
 * /services/votes:
 *   get:
 *     description: Returns a candidate street for the user to vote on
 *     tags:
 *       - sentiment
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Street data
 *         schema:
 *           type: object
 *           properties:
 *             data:
 *               type: string
 */
routes.get('/services/votes', cors(), jwtCheck, resources.services.votes.get)
/**
 * @swagger
 * /services/votes:
 *   post:
 *     description: Adds a user's vote on a particular street
 *     tags:
 *       - sentiment
 *     produces:
 *      - application/json
 *     parameters:
 *       - name: vote
 *         description: user's score of a street
 *         in:  body
 *         required: true
 *         type: string
 *         schema:
 *           $ref: '#/definitions/NewSubscription'
 *     responses:
 *       200:
 *         description: Street data
 *         schema:
 *           type: object
 *           properties:
 *             data:
 *               type: string
 */
routes.post('/services/votes', cors(), jwtCheck, resources.services.votes.post)

module.exports = routes
