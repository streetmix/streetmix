const config = require('config')
const uuid = require('uuid')
const Twitter = require('twitter')
const User = require('../../models/user.js')
const { ERRORS } = require('../../../lib/util')
const logger = require('../../../lib/logger.js')()

exports.post = function (req, res) {
  let loginToken = null
  const handleCreateUser = function (err, user) {
    if (err) {
      logger.error(err)
      res.status(500).send('Could not create user.')
      return
    }
    const userJson = { id: user.id, loginToken: loginToken }
    logger.info({ user: userJson }, 'New user created.')
    res.header('Location', config.restapi.baseuri + '/v1/users/' + user.id)
    res.status(201).send(userJson)
  } // END function - handleCreateUser

  const handleUpdateUser = function (err, user) {
    if (err) {
      logger.error(err)
      res.status(500).send('Could not update user.')
      return
    }

    const userJson = { id: user.id, loginToken: loginToken }
    logger.info({ user: userJson }, 'Existing user issued new login token.')

    res.header('Location', config.restapi.baseuri + '/v1/users/' + user.id)
    res.status(200).send(userJson)
  } // END function - handleUpdateUser

  const handleAuth0TwitterSignIn = function (credentials) {
    const handleFindUser = function (err, user) {
      if (err) {
        logger.error(err)
        res.status(500).send('Error finding user with Auth0 ID.')
        return
      }

      loginToken = uuid.v1()
      if (!user) {
        const u = new User({
          id: credentials.screenName,
          auth0_id: credentials.auth0_id,
          login_tokens: [ loginToken ],
          profile_image_url: credentials.profile_image_url
        })
        u.save(handleCreateUser)
      } else {
        user.id = credentials.screenName
        user.auth0_id = credentials.auth0_id
        user.profile_image_url = credentials.profile_image_url
        user.login_tokens.push(loginToken)
        user.save(handleUpdateUser)
      }
    } // END function - handleFindUser

    User.findOne({ id: credentials.screenName }, handleFindUser)
  } // END function - handleAuth0TwitterSignIn

  const handleTwitterSignIn = function (twitterCredentials) {
    // TODO: Call Twitter API with OAuth access credentials to make sure they are valid
    const handleFindUser = function (err, user) {
      if (err) {
        logger.error(err)
        res.status(500).send('Error finding user with Twitter ID.')
        return
      }
      loginToken = uuid.v1()
      if (!user) {
        const u = new User({
          id: twitterCredentials.screenName,
          twitter_id: twitterCredentials.userId,
          twitter_credentials: {
            access_token_key: twitterCredentials.oauthAccessTokenKey,
            access_token_secret: twitterCredentials.oauthAccessTokenSecret
          },
          login_tokens: [ loginToken ]
        })
        u.save(handleCreateUser)
      } else {
        user.id = twitterCredentials.screenName
        user.twitter_id = twitterCredentials.userId
        user.twitter_credentials = {
          access_token_key: twitterCredentials.oauthAccessTokenKey,
          access_token_secret: twitterCredentials.oauthAccessTokenSecret
        }
        user.login_tokens.push(loginToken)
        user.save(handleUpdateUser)
      }
    } // END function - handleFindUser
    // Try to find user with twitter ID
    User.findOne({ twitter_id: twitterCredentials.userId }, handleFindUser)
  } // END function - handleTwitterSignIn

  /**
   * Returns a randomly-generated 4-digit string of a number between 0000 and 9999
   *
   * @returns {string}
   */
  const generateRandomId = () => Math.floor(Math.random() * 10000).toString().padStart(4, '0')

  const generateId = function (nickname) {
    // TODO - Check if the Id generated is not existing
    const id = generateRandomId()
    return nickname + '-' + id
  }

  const handleAuth0SignIn = async function (credentials) {
    try {
      const user = await User.findOne({ auth0_id: credentials.auth0_id })
      loginToken = uuid.v1()
      if (!user) {
        const numOfUser = await User.count({ id: credentials.nickname })
        // Ensure there is no existing user with id same this nickname
        if (numOfUser === 0) {
          const u = new User({
            id: credentials.nickname,
            auth0_id: credentials.auth0_id,
            email: credentials.email,
            login_tokens: [ loginToken ],
            profile_image_url: credentials.profile_image_url
          })
          u.save(handleCreateUser)
        } else {
          const id = generateId(credentials.nickname)
          const u = new User({
            id: id,
            auth0_id: credentials.auth0_id,
            email: credentials.email,
            login_tokens: [ loginToken ],
            profile_image_url: credentials.profile_image_url
          })
          u.save(handleCreateUser)
        }
      } else {
        user.auth0_id = credentials.auth0_id
        user.profile_image_url = credentials.profile_image_url
        user.email = credentials.email
        user.login_tokens.push(loginToken)
        user.save(handleUpdateUser)
      }
    } catch (err) {
      logger.error(err)
      console.log(err)
      res.status(500).send('Error finding user with Auth0 ID.')
    }
  } // END function - handleAuth0SignIn

  let body
  try {
    body = req.body
  } catch (e) {
    res.status(400).send('Could not parse body as JSON.')
    return
  }

  if (body.hasOwnProperty('twitter')) {
    handleTwitterSignIn(body.twitter)
  } else if (body.hasOwnProperty('auth0_twitter')) {
    handleAuth0TwitterSignIn(body.auth0_twitter)
  } else if (body.hasOwnProperty('auth0')) {
    handleAuth0SignIn(body.auth0)
  } else {
    res.status(400).send('Unknown sign-in method used.')
  }
} // END function - exports.post

exports.get = async function (req, res) {
  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).send('Please provide user ID.')
    return
  }

  const userId = req.params.user_id

  const findUserById = async function (userId) {
    let user

    try {
      user = await User.findOne({ id: userId })
    } catch (err) {
      logger.error(err)
      throw new Error(ERRORS.CANNOT_GET_USER)
    }

    if (!user) {
      throw new Error(ERRORS.USER_NOT_FOUND)
    }

    return user
  }

  const findUserByLoginToken = async function (loginToken) {
    let user

    try {
      user = await User.findOne({ login_tokens: { $in: [ loginToken ] } })
    } catch (err) {
      logger.error(err)
      throw new Error(ERRORS.CANNOT_GET_USER)
    }

    if (!user) {
      throw new Error(ERRORS.UNAUTHORISED_ACCESS)
    }

    return user
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
      const auth = (user.login_tokens.indexOf(req.loginToken) > 0)

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
    findUserById(userId)
      .then(handleFindUser)
      .catch(handleError)
  }
}

exports.delete = async function (req, res) {
  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).send('Please provide user ID.')
    return
  }

  const userId = req.params.user_id

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

  const idx = user.login_tokens.indexOf(req.loginToken)
  if (idx === -1) {
    res.status(401).end()
    return
  }
  user.login_tokens.splice(idx, 1)

  user.save().then(user => {
    res.status(204).end()
  }).catch(err => {
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

  if (userId === targetUserId || user.role.includes('ADMIN')) {
    targetUser.data = body.data || targetUser.data
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
