const config = require('config')
const Twitter = require('twitter')
const cloudinary = require('cloudinary')
const User = require('../../models/user.js')
const { ERRORS } = require('../../../lib/util')
const logger = require('../../../lib/logger.js')()

exports.get = async function (req, res) {
  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).send('Please provide user ID.')
    return
  }

  const targetUserId = req.params.user_id
  let targetUser

  const findUserById = async function (userId) {
    try {
      targetUser = await User.findOne({ id: userId })
    } catch (err) {
      logger.error(err)
      throw new Error(ERRORS.CANNOT_GET_USER)
    }

    if (!targetUser) {
      throw new Error(ERRORS.USER_NOT_FOUND)
    }

    return targetUser
  }

  let requestUser

  const findUserByLoginToken = async function (loginToken) {
    try {
      requestUser = await User.findOne({ login_tokens: { $in: [ loginToken ] } })
    } catch (err) {
      logger.error(err)
      throw new Error(ERRORS.CANNOT_GET_USER)
    }

    if (!requestUser) {
      throw new Error(ERRORS.UNAUTHORISED_ACCESS)
    }

    // Finding target user
    if (req.user_id !== targetUserId) {
      try {
        targetUser = await findUserById(targetUserId)
      } catch (error) {
        logger.error(error)
        throw new Error(ERRORS.CANNOT_GET_USER)
      }

      if (!targetUser) {
        throw new Error(ERRORS.UNAUTHORISED_ACCESS)
      }
    } else {
      targetUser = requestUser
    }

    return targetUser
  }

  const handleFindUser = function (user) {
    let twitterApiClient

    try {
      twitterApiClient = new Twitter({
        consumer_key: config.twitter.oauth_consumer_key,
        consumer_secret: config.twitter.oauth_consumer_secret,
        access_token_key: user.twitter_credentials.access_token_key,
        access_token_secret: user.twitter_credentials.access_token_secret
      })
    } catch (error) {
      logger.error('Could not initialize Twitter API client: ' + error)
    }

    const sendUserJson = function (data) {
      // If requestUser = targetUser => permission granted
      // If requestUser exists and requestUser != targetUser and requestUser is admin => permission granted
      const auth = (user.login_tokens.indexOf(req.loginToken) !== -1) || (requestUser && requestUser.roles.includes('ADMIN'))

      user.asJson({ auth: auth }, function (err, userJson) {
        if (err) {
          logger.error(err)
          res.status(500).send('Could not render user JSON.')
          return
        }

        if (data) {
          userJson.profileImageUrl = data.twitter_profile_image_url
        } else {
          userJson.profileImageUrl = user.profile_image_url
        }

        res.status(200).send(userJson)
      })
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

  if (req.loginToken) {
    findUserByLoginToken(req.loginToken)
      .then(handleFindUser)
      .catch(handleError)
  } else {
    findUserById(targetUserId)
      .then(handleFindUser)
      .catch(handleError)
  }
}

exports.put = async function (req, res) {
  let body
  try {
    body = req.body
  } catch (e) {
    res.status(400).send('Could not parse body as JSON.')
    return
  }

  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).send('Please provide user ID.')
    return
  }

  // 1. on auth header, check userId matches their login token
  // 2a. if auth.userId = params.userId => permission granted
  // 2b. if auth.userId != params.userId, auth.userId IS admin => permission granted

  // Find requesting user
  const userId = req.userId
  let user

  try {
    user = await User.findOne({ id: userId })
  } catch (err) {
    logger.error(err)
    res.status(500).send('Error finding user.')
  }

  if (!user) {
    res.status(404).send('User not found.')
    return
  }

  // Is requesting user logged in?
  if (user.login_tokens.indexOf(req.loginToken) === -1) {
    res.status(401).end()
    return
  }

  // Find target user
  const targetUserId = req.params.user_id
  let targetUser
  if (userId !== targetUserId) {
    try {
      targetUser = await User.findOne({ id: targetUserId })
    } catch (err) {
      logger.error(err)
      res.status(500).send('Error finding user.')
    }

    if (!targetUser) {
      res.status(404).send('User not found.')
      return
    }
  } else {
    targetUser = user
  }

  if (userId === targetUserId || user.roles.includes('ADMIN')) {
    targetUser.data = body.data || targetUser.data
    targetUser.flags = body.flags || targetUser.flags

    targetUser.roles = body.roles || targetUser.roles
    targetUser.id = body.id || targetUser.id
    targetUser.profile_image_url = body.profileImageUrl || targetUser.profile_image_url

    targetUser.save().then(user => {
      res.status(204).end()
    }).catch(err => {
      logger.error(err)
      res.status(500).send('Could not update user information.')
    })
  } else {
    res.status(401).end()
  }
} // END function - exports.put

exports.delete = async function (req, res) {
  if (!req.params.user_id) {
    res.status(400).send('Please provide user ID.')
    return
  } else if (!req.loginToken) {
    res.status(400).send('Please provide login token.')
  }

  const userId = req.userId
  const targetUserId = req.params.user_id

  let requestUser

  try {
    requestUser = await User.findOne({ id: userId })
  } catch (error) {
    logger.error(error)
    res.status(500).send('Error finding user.')
  }

  if (!requestUser) {
    res.status(404).send('User not found.')
    return
  }

  // Is requesting user logged in?
  if (requestUser.login_tokens.indexOf(req.loginToken) === -1) {
    res.status(401).end()
    return
  }

  let targetUser
  if (targetUserId !== userId) {
    try {
      targetUser = await User.findOne({ id: targetUserId })
    } catch (error) {
      logger.error(error)
      res.status(500).send('Error finding user.')
    }

    if (!targetUser) {
      res.status(404).send('User not found.')
      return
    }
  } else {
    targetUser = requestUser
  }

  const handleDeleteUser = async function (err, user) {
    if (err) {
      logger.error(err)
      res.status(500).send('Error deleting user.')
    }

    if (!user) {
      res.status(404).send('User not found.')
      return
    }

    // If successful in deleting user, delete user's profile image cached in cloudinary.
    const publicId = `${config.env}/profile_image/${targetUserId}`

    try {
      await cloudinary.v2.uploader.destroy(publicId)
    } catch (error) {
      // If unable to delete user's profile image from cloudinary, log error and continue.
      logger.error(error)
    }

    res.status(204).end()
  }

  if (userId === targetUserId || requestUser.roles.includes('ADMIN')) {
    User.deleteOne({ id: targetUserId }, handleDeleteUser)
  } else {
    res.status(401).end()
  }
}
