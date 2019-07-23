const config = require('config')
const uuid = require('uuid')
const Twitter = require('twitter')
const { isArray } = require('lodash')
const { ERRORS } = require('../../../lib/util')
const logger = require('../../../lib/logger.js')()
const { User, Sequelize } = require('../../db/models')

const Op = Sequelize.Op

exports.post = async function (req, res) {
  let loginToken = null
  let body

  try {
    body = req.body
  } catch (e) {
    res.status(400).send('Could not parse body as JSON.')
    return
  }

  const handleUserSignIn = function (user) {
    if (isArray(user)) {
      const userData = user[1][0]
      const userJson = {
        id: userData.id,
        loginToken: loginToken
      }
      logger.info({ user: userJson }, 'Existing user issued new login token.')
      res.header('Location', config.restapi.baseuri + '/v1/users/' + user.id)
      res.status(200).send(userJson)
      return
    }

    const userJson = { id: user.id, loginToken: loginToken }
    logger.info({ user: userJson }, 'New user created.')
    res.header('Location', config.restapi.baseuri + '/v1/users/' + user.id)
    res.status(201).send(userJson)
  }

  const parseUserData = function (body) {
    // function generateId (nickname) {
    //   // TODO - Check if the Id generated is not existing
    //   return nickname + '-' + random(0, 999)
    // }
    loginToken = uuid.v1()

    if (body.hasOwnProperty('twitter')) {
      const credentials = body.twitter
      return {
        id: credentials.screenName,
        twitter_id: credentials.userId,
        twitter_credentials: {
          access_token_key: credentials.oauthAccessTokenKey,
          access_token_secret: credentials.oauthAccessTokenSecret
        },
        login_tokens: [ loginToken ]
      }
    } else if (body.hasOwnProperty('auth0_twitter')) {
      const credentials = body.auth0_twitter
      return {
        id: credentials.screenName,
        auth0_id: credentials.auth0_id,
        login_tokens: [ loginToken ],
        profile_image_url: credentials.profile_image_url
      }
    } else if (body.hasOwnProperty('auth0_email')) {
      const credentials = body.auth0_email
      return {
        id: credentials.nickname,
        auth0_id: credentials.auth0_id,
        email: credentials.email,
        login_tokens: [ loginToken ],
        profile_image_url: credentials.profile_image_url
      }
    }
    return null
  }

  const updateOrCreateUser = async function (credentials) {
    let user
    try {
      user = await User.findByPk(credentials.id)
    } catch (err) {
      logger.error(err)
      throw new Error(ERRORS.CANNOT_GET_USER)
    }

    if (!user) {
      return User.create(credentials)
    } else {
      return User.update(credentials, { where: { id: credentials.id }, returning: true })
    }
  }

  const handleError = function (error) {
    switch (error) {
      case ERRORS.USER_NOT_FOUND:
        res.status(404).send('User not found.')
        return
      case ERRORS.CANNOT_GET_USER:
        res.status(500).send('Error finding user.')
        return
      case ERRORS.UNAUTHORISED_ACCESS:
        res.status(401).send('User with that login token not found.')
        return
      default:
        res.status(500).end()
    }
  }

  const credentials = parseUserData(body)

  if (!credentials) {
    res.status(400).send('Unknown sign-in method used.')
  }

  updateOrCreateUser(credentials)
    .then(handleUserSignIn)
    .catch(handleError)
} // END function - exports.post

exports.get = async function (req, res) {
  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).send('Please provide user ID.')
    return
  }
  const userId = req.params.user_id
  const handleFindUser = function (user) {
    let twitterApiClient
    try {
      twitterApiClient = new Twitter({
        consumer_key: config.twitter.oauth_consumer_key,
        consumer_secret: config.twitter.oauth_consumer_secret,
        access_token_key: user.twitter_credentials.access_token_key,
        access_token_secret: user.twitter_credentials.access_token_secret
      })
    } catch (e) {
      logger.error('Could not initialize Twitter API client. Error:')
      logger.error(e)
    }

    const sendUserJson = function (data) {
      if (data) {
        user.profileImageUrl = data.twitter_profile_image_url
      } else {
        user.profileImageUrl = user.profile_image_url
      }
      res.status(200).send(user)
    } // END function - sendUserJson

    let responseAlreadySent = false

    const handleFetchUserProfileFromTwitter = function (err, res) {
      if (err) {
        logger.error('Twitter API call users/show returned error.')
        logger.error(err)
      }

      if (responseAlreadySent) {
        logger.debug({ profile_image_url: res.profile_image_url }, 'Twitter API users/show call returned but response already sent!')
      } else {
        logger.debug({ profile_image_url: res.profile_image_url }, 'Twitter API users/show call returned. Sending response with Twitter data.')
        responseAlreadySent = true

        if (!res) {
          logger.error('Twitter API call users/show did not return any data.')
        }

        sendUserJson({
          twitter_profile_image_url: res.picture
        })
      }
    } // END function - handleFetchUserProfileFromTwitter

    if (twitterApiClient && !user.profile_image_url) {
      logger.debug('About to call Twitter API: /users/show.json?user_id=' + user.twitter_id)
      twitterApiClient.get('/users/show.json', { user_id: user.twitter_id }, handleFetchUserProfileFromTwitter)
      setTimeout(function () {
        if (!responseAlreadySent) {
          logger.debug(`Timing out Twitter API call after %d milliseconds and sending partial response.`, config.twitter.timeout_ms)
          responseAlreadySent = true
          sendUserJson()
        }
      }, config.twitter.timeout_ms)
    } else {
      sendUserJson()
    }
  } // END function - handleFindUser

  const handleError = function (error) {
    switch (error) {
      case ERRORS.USER_NOT_FOUND:
        res.status(404).send('User not found.')
        return
      case ERRORS.CANNOT_GET_USER:
        res.status(500).send('Error finding user.')
        return
      case ERRORS.UNAUTHORISED_ACCESS:
        res.status(401).send('User with that login token not found.')
        return
      default:
        res.status(500).end()
    }
  }

  const findUserByLoginToken = async function (loginToken) {
    let user
    try {
      user = await User.findOne({
        where: { login_tokens: { [Op.contains]: [ loginToken ] } }
      })
    } catch (err) {
      logger.error(err)
      throw new Error(ERRORS.CANNOT_GET_USER)
    }

    if (!user) {
      throw new Error(ERRORS.UNAUTHORISED_ACCESS)
    }
    return user
  }

  const findUserById = async function (userId) {
    let user
    try {
      user = await User.findByPk(userId)
    } catch (err) {
      logger.error(err)
      throw new Error(ERRORS.CANNOT_GET_USER)
    }

    if (!user) {
      throw new Error(ERRORS.USER_NOT_FOUND)
    }
    return user
  }

  if (req.loginToken) {
    findUserByLoginToken(req.loginToken)
      .then(handleFindUser)
      .catch(handleError)
  } else {
    findUserById(userId)
      .then(handleFindUser)
      .catch(handleError)
  }
} // END function - exports.get

exports.delete = async function (req, res) {
  const userId = req.params.user_id
  let user
  try {
    user = await User.findByPk(userId)
  } catch (err) {
    logger.error(err)
    res.status(500).send('Error finding user.')
  }

  if (!user) {
    res.status(404).send('User not fouloginTokennd.')
    return
  }

  const idx = user.login_tokens.indexOf(req.loginToken)
  if (idx === -1) {
    res.status(401).end()
    return
  }
  user.login_tokens.splice(idx, 1)
  User.update(user, { where: { id: user.id }, returning: true })
    .then(result => {
      res.status(204).end()
    })
    .catch(err => {
      logger.error(err)
      res.status(500).send('Could not sign-out user.')
    })
} // END function - exports.delete

exports.put = async function (req, res) {
  let body
  try {
    body = req.body
  } catch (e) {
    res.status(400).send('Could not parse body as JSON.')
    return
  }

  const userId = req.params.user_id
  let user

  try {
    user = await User.findByPk(userId)
  } catch (err) {
    logger.error(err)
    res.status(500).send('Error finding user.')
  }

  if (!user) {
    res.status(404).send('User not found.')
    return
  }

  if (user.login_tokens.indexOf(req.loginToken) === -1) {
    res.status(401).end()
    return
  }

  user.data = body.data || user.data
  User.update(user, { where: { id: user.id }, returning: true })
    .then(result => {
      res.status(204).end()
    })
    .catch(err => {
      logger.error(err)
      res.status(500).send('Could not update user information.')
    })
} // END function - exports.put
