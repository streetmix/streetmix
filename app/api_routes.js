import { Router } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import * as v1 from './resources/v1/index.js'
import { BTPTokenCheck } from './resources/services/integrations/coil.js'
import jwtCheck from './authentication.js'

// Base path of router is `/api` (see app.js)
const router = Router()

/**
 * @swagger
 *
 * definitions:
 *   UserData:
 *     type: object
 *     properties:
 *       lastStreetId:
 *         type: string
 *         format: uuid
 *       lastStreetNamespacedId:
 *         type: integer
 *       lastStreetCreatorId:
 *         type: string
 *       saveAsImageTransparentSky:
 *         type: boolean
 *       saveAsImageSegmentNamesAndWidths:
 *         type: boolean
 *       saveAsImageStreetName:
 *         type: boolean
 *       newStreetPreference:
 *         type: integer
 *   User:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *       data:
 *         $ref: '#/definitions/UserData'
 *       createdAt:
 *         type: string
 *         format: date-time
 *       updatedAt:
 *        type: string
 *        format: date-time
 *       profileImageUrl:
 *         type: string
 *         example: "https://pbs.twimg.com/profile_images/461825032621027328/j8-0jPD5_normal.png"
 *       roles:
 *         type: array
 *         items:
 *           type: string
 *           example: "USER"
 *   Language:
 *     type: object
 *     properties:
 *       code:
 *         type: string
 *         example: "en"
 *       name:
 *         type: string
 *         example: "English"
 *       native:
 *         type: string
 *         example: "English"
 *   GeolocationResponse:
 *     type: object
 *     properties:
 *       countryCode:
 *         type: string
 *         example: "US"
 *   StreetImageData:
 *     type: object
 *     properties:
 *       public_id:
 *         type: string
 *       width:
 *         type: integer
 *       height:
 *         type: integer
 *       format:
 *         type: string
 *       secure_url:
 *         type: string
 *       created_at:
 *         type: string
 *         format: date-time
 *   Segment:
 *     type: object
 *     required:
 *       - type
 *       - width
 *       - variantString
 *     properties:
 *       id:
 *         type: string
 *         format: nanoid
 *       type:
 *         type: string
 *       variantString:
 *         type: string
 *       width:
 *         type: integer
 *   StreetData:
 *     type: object
 *     properties:
 *       street:
 *         type: object
 *         properties:
 *           schemaVersion:
 *             type: integer
 *           width:
 *             type: integer
 *           id:
 *             type: string
 *             format: uuid
 *           units:
 *             type: number
 *           location:
 *             type: object
 *           userUpdated:
 *             type: boolean
 *           skybox:
 *             type: string
 *           leftBuildingHeight:
 *             type: string
 *           rightBuildingHeight:
 *             type: string
 *           segments:
 *             type: array
 *             items:
 *               $ref: '#/definitions/Segment'
 *           editCount:
 *             type: integer
 *   NewStreetImage:
 *     $ref: '#/definitions/StreetImageData'
 *   NewStreet:
 *     type: object
 *     required:
 *       - data
 *       - password
 *     properties:
 *       name:
 *         type: string
 *       data:
 *         $ref: '#/definitions/StreetData'
 *   Street:
 *     type: object
 *     required:
 *       - id
 *     properties:
 *       id:
 *         type: string
 *         format: uuid
 *       namespacedId:
 *         type: integer
 *         format: int64
 *       status:
 *         type: string
 *         example: "ACTIVE"
 *       name:
 *         type: string
 *       creatorId:
 *         type: string
 *       creatorIp:
 *         type: string
 *       data:
 *         $ref: '#/definitions/StreetData'
 *       createdAt:
 *         type: string
 *         format: date-time
 *       updatedAt:
 *         type: string
 *         format: date-time
 *         description: Server-side updates will update this timestamp. This is the canonical timestamp for the street and should be used for display purposes.
 *       clientUpdatedAt:
 *         type: string
 *         format: date-time
 *         description: Client-side updates will update this timestamp. This should only be used to verify the age of client side data.
 *   Flags:
 *     type: object
 *     example:
 *       SEGMENT_CONSTRUCTION:
 *         label: "Segment — construction items"
 *         defaultValue: false
 *     properties:
 *       flagId:
 *         type: object
 *         $ref: '#/definitions/FlagItem'
 *   FlagItem:
 *     type: object
 *     properties:
 *       label:
 *         type: string
 *         description: "Label for this flag in the UI"
 *         example: "Segment — construction items"
 *       defaultValue:
 *         type: boolean
 *         description: "Default value for this flag"
 *         example: "false"
 *       enabled:
 *         type: boolean
 *         description: "Whether editing the state of this flag is allowed (optional property, defaults to true)"
 *         example: "true"
 */

// Enable CORS for all OPTIONs "pre-flight" requests
router.options(/.*/, cors())

// API: all users

/**
 * @swagger
 *
 * /api/v1/users:
 *   post:
 *     description: Creates a user
 *     tags:
 *       - users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         type: string
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: Streets
 *         schema:
 *           $ref: '#/definitions/User'
 */
router.post('/v1/users', cors(), jwtCheck, v1.users.post)

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     description: Returns users
 *     parameters:
 *       - in: params
 *         name: userId
 *         schema:
 *           type: string
 *           required: true
 *     tags:
 *       - users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: User
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/User'
 */
router.get('/v1/users', cors(), jwtCheck, v1.users.get)

// API: single user

/**
 * @swagger
 * /api/v1/users/{user_id}:
 *   delete:
 *     description: Deletes user
 *     tags:
 *       - users
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the user to delete
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: users
 *         schema:
 *           $ref: '#/definitions/User'
 *   get:
 *     description: Returns user
 *     tags:
 *       - users
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the user to get
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: users
 *         schema:
 *           $ref: '#/definitions/User'
 *   put:
 *     description: Updates user
 *     tags:
 *       - users
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user to update
 *       - in: body
 *         name: id
 *         schema:
 *           type: string
 *       - in: body
 *         name: profileImageUrl
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: body
 *         name: roles
 *         type: array
 *         items:
 *           type: string
 *           example: "USER"
 *       - in: body
 *         name: flags
 *         type: object
 *       - in: body
 *         name: data
 *         description: user data
 *         required: true
 *         type: string
 *         schema:
 *           $ref: '#/definitions/UserData'
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: users
 *         schema:
 *           $ref: '#/definitions/User'
 *
 */
router.get('/v1/users/:user_id', cors(), jwtCheck, BTPTokenCheck, v1.users.get)
router.put('/v1/users/:user_id', cors(), jwtCheck, v1.users.put)
router.patch('/v1/users/:user_id', cors(), jwtCheck, v1.users.patch)
router.delete('/v1/users/:user_id', cors(), jwtCheck, v1.users.del)

/**
 * @swagger
 * /api/v1/users/{user_id}/login-token:
 *   delete:
 *     description: Logs out current user
 *     tags:
 *       - users
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the user
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: succesfully logged out user
 */
router.delete(
  '/v1/users/:user_id/login-token',
  cors(),
  jwtCheck,
  v1.userSession.del
)

/**
 * @swagger
 * /api/v1/users/{user_id}/streets:
 *   delete:
 *     description: Sets status to DELETED for ALL the streets of a given user
 *     tags:
 *       - users
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the user
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: succesfully deleted streets
 *   get:
 *     description: Returns all streets by a given user
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the user
 *     tags:
 *       - users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: user streets
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Street'
 */
router.delete(
  '/v1/users/:user_id/streets',
  cors(),
  jwtCheck,
  v1.usersStreets.del
)
router.get('/v1/users/:user_id/streets', cors(), v1.usersStreets.get)

/**
 * @swagger
 *
 * /api/v1/streets:
 *   post:
 *     description: Creates a street
 *     tags:
 *       - streets
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: street
 *         description: Street object
 *         in: body
 *         required: true
 *         type: string
 *         schema:
 *           $ref: '#/definitions/NewStreet'
 *     responses:
 *       200:
 *         description: Streets
 *         schema:
 *           $ref: '#/definitions/Street'
 */
router.post('/v1/streets', jwtCheck, v1.streets.post)

/**
 * @swagger
 * /api/v1/streets:
 *   get:
 *     description: Returns streets
 *     parameters:
 *       - in: query
 *         name: creatorId
 *         schema:
 *           type: string
 *       - in: query
 *         name: namespaceId
 *         schema:
 *           type: string
 *       - in: query
 *         name: start
 *         schema:
 *           type: number
 *           example: 0
 *       - in: query
 *         name: count
 *         schema:
 *           type: number
 *           example: 20
 *     tags:
 *       - streets
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: streets
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Street'
 *   head:
 *     description: Returns streets
 *     parameters:
 *       - in: query
 *         name: creatorId
 *         schema:
 *           type: string
 *       - in: query
 *         name: namespaceId
 *         schema:
 *           type: string
 *       - in: query
 *         name: start
 *         schema:
 *           type: number
 *           example: 0
 *       - in: query
 *         name: count
 *         schema:
 *           type: number
 *           example: 20
 *     tags:
 *       - streets
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: streets
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Street'
 */
router.get('/v1/streets', jwtCheck, v1.streets.find)
router.head('/v1/streets', jwtCheck, v1.streets.find)

/**
 * @swagger
 * /api/v1/streets/{street_id}:
 *   delete:
 *     description: Deletes street
 *     tags:
 *       - streets
 *     parameters:
 *       - in: path
 *         name: street_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the street to delete
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: streets
 *         schema:
 *           $ref: '#/definitions/Street'
 *   head:
 *     description: Returns street
 *     tags:
 *       - streets
 *     parameters:
 *       - in: path
 *         name: street_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the street to get
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: streets
 *         schema:
 *           $ref: '#/definitions/Street'
 *   get:
 *     description: Returns street
 *     tags:
 *       - streets
 *     parameters:
 *       - in: path
 *         name: street_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the street to get
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: streets
 *         schema:
 *           $ref: '#/definitions/Street'
 *   put:
 *     description: Updates street
 *     tags:
 *       - streets
 *     parameters:
 *       - in: path
 *         name: street_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the street to update
 *       - in: body
 *         name: name
 *         schema:
 *           type: string
 *       - in: body
 *         name: originalStreetId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: body
 *         name: data
 *         description: Street data
 *         required: true
 *         type: string
 *         schema:
 *           $ref: '#/definitions/StreetData'
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: streets
 *         schema:
 *           $ref: '#/definitions/Street'
 *
 */
router.delete('/v1/streets/:street_id', jwtCheck, v1.streets.del)
router.head('/v1/streets/:street_id', jwtCheck, v1.streets.get)
router.get('/v1/streets/:street_id', jwtCheck, v1.streets.get)
router.put('/v1/streets/:street_id', jwtCheck, v1.streets.put)

/**
 * @swagger
 * /api/v1/streets/{street_id}/image:
 *   delete:
 *     description: Deletes street thumbnail from cloudinary
 *     tags:
 *       - images
 *     parameters:
 *       - in: path
 *         name: street_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the street
 *     produces:
 *       - application/json
 *     responses:
 *       204:
 *         description: Success
 *   get:
 *     description: Returns street thumbnail from cloudinary, mainly used to set metatag information for social sharing cards
 *     tags:
 *       - images
 *     parameters:
 *      - in: path
 *        name: street_id
 *        schema:
 *          type: string
 *          format: uuid
 *        required: true
 *        description: ID of the street
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: street image
 *         schema:
 *           $ref: '#/definitions/StreetImageData'
 *       204:
 *         description: Empty response. The owner of this street has deleted the thumbnail.
 *   post:
 *     description: Creates a street thumbnail
 *     tags:
 *       - images
 *     parameters:
 *       - in: path
 *         name: street_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID of the street to update
 *       - in: body
 *         name: street image
 *         description: Street image object
 *         required: true
 *         type: string
 *         schema:
 *           $ref: '#/definitions/NewStreetImage'
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: street image
 *         schema:
 *           $ref: '#/definitions/StreetImageData'
 *
 */
router.post(
  '/v1/streets/:street_id/image',
  bodyParser.text({ limit: '3mb' }),
  jwtCheck,
  v1.streetImages.post
)
router.delete('/v1/streets/:street_id/image', jwtCheck, v1.streetImages.del)
router.get('/v1/streets/:street_id/image', jwtCheck, v1.streetImages.get)

/**
 * @swagger
 * /api/v1/streets/{street_id}/remixes:
 *   get:
 *     description: Returns all remixes of a street
 *     tags:
 *       - streets
 *       - remixes
 *     parameters:
 *      - in: path
 *        name: street_id
 *        schema:
 *          type: string
 *          format: uuid
 *        required: true
 *        description: ID of the street
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: user streets
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Street'
 */
router.get('/v1/streets/:street_id/remixes', jwtCheck, v1.streetRemixes.get)

/**
 * @swagger
 * /api/v1/translate/{locale_code}/{resource_name}:
 *   get:
 *     description: Returns geolocation data for the current user
 *     parameters:
 *       - in: path
 *         name: locale_code
 *         schema:
 *           type: string
 *       - in: path
 *         name: resource_name
 *         schema:
 *           type: string
 *     tags:
 *       - translation
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Translations for streetmix  Shape depends on resource.
 */
router.get('/v1/translate/:locale_code/:resource_name', v1.translate.get)

/**
 * @swagger
 * /api/v1/votes:
 *   get:
 *     description: Returns a candidate street for the user to vote on
 *     tags:
 *       - sentiment
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Street data
 *         schema:
 *           type: object
 *           properties:
 *             data:
 *               type: object
 *             score:
 *               type: number
 *             id:
 *               type: string
 *             streetId:
 *               type: string
 *             voterId:
 *               type: string
 */
router.get('/v1/votes', cors(), jwtCheck, v1.votes.get)

/**
 * @swagger
 * /api/v1/votes:
 *   post:
 *     description: Adds a user's vote on a particular street
 *     tags:
 *       - sentiment
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: data
 *         description: data of the street being rated
 *         in: body
 *         type: string
 *       - name: score
 *         description: user's score of a street
 *         in: body
 *         type: number
 *       - name: streetId
 *         description: ID of street being rated
 *         in: body
 *         type: string
 *     responses:
 *       200:
 *         description: Street data
 *         schema:
 *           type: object
 *           properties:
 *             data:
 *               type: object
 *             score:
 *               type: number
 *             id:
 *               type: string
 *             streetId:
 *               type: string
 *             voterId:
 *               type: string
 */
router.post('/v1/votes', cors(), jwtCheck, v1.votes.post)
router.put('/v1/votes', cors(), jwtCheck, v1.votes.put)

// Catch all for all broken api paths, direct to 404 response.
router.all(/.*/, (req, res) => {
  res
    .status(404)
    .json({ status: 404, error: 'Not found. Did you mispell something?' })
})

export default router
