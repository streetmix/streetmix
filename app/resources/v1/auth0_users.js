const config = require('config')
const uuid = require('uuid')
const User = require('../../models/user.js')
const logger = require('../../../lib/logger.js')()
const { Management } = require('../../../lib/auth0')

exports.post = function (req, res) {
  var loginToken = null

  var handleTwitterSignIn = function (credentials) {
    // TODO: Call Twitter API with OAuth access credentials to make sure they are valid

    var handleCreateUser = function (err, user) {
      if (err) {
        logger.error(err)
        res.status(500).send('Could not create user.')
        return
      }

      var userJson = { id: user.id, loginToken: loginToken }
      logger.info({ user: userJson }, 'New user created.')
      res.header('Location', config.restapi.baseuri + '/v1/users/' + user.id)
      res.status(201).send(userJson)
    } // END function - handleCreateUser

    var handleUpdateUser = function (err, user) {
      if (err) {
        logger.error(err)
        res.status(500).send('Could not update user.')
        return
      }
      var userJson = { id: user.id, loginToken: loginToken }
      logger.info({ user: userJson }, 'Existing user issued new login token.')

      res.header('Location', config.restapi.baseuri + '/v1/users/' + user.id)
      res.status(200).send(userJson)
    } // END function - handleUpdateUser

    var handleFindUser = function (err, user) {
      if (err) {
        logger.error(err)
        res.status(500).send('Error finding user with Auth0 ID.')
        return
      }

      loginToken = uuid.v1()
      if (!user) {
        var u = new User({
          id: credentials.screenName,
          auth0_id: credentials.auth0_id,
          auth0_refresh_token: credentials.refresh_token,
          login_tokens: [ loginToken ]
        })
        u.save(handleCreateUser)
      } else {
        user.id = credentials.screenName
        user.auth0_refresh_token = credentials.refresh_token
        user.auth0_id = credentials.auth0_id
        user.login_tokens.push(loginToken)
        user.save(handleUpdateUser)
      }
    } // END function - handleFindUser

    User.findOne({ id: credentials.screenName }, handleFindUser)
  } // END function - handleTwitterSignIn

  var body
  try {
    body = req.body
  } catch (e) {
    res.status(400).send('Could not parse body as JSON.')
    return
  }

  if (body.hasOwnProperty('auth0_twitter')) {
    // TODO: Validation
    handleTwitterSignIn(body.auth0_twitter)
  } else {
    res.status(400).send('Unknown sign-in method used.')
  }
} // END function - exports.post

exports.get = function (req, res) {
  var handleFindUserById = function (err, user) {
    if (err) {
      logger.error(err)
      res.status(500).send('Error finding user.')
      return
    }

    if (!user) {
      res.status(404).send('User not found.')
      return
    }

    var auth0Manage
    try {
      auth0Manage = Management()
    } catch (e) {
      logger.error('Could not initialize Auth0 Management API client. Error:')
      logger.error(e)
    }

    var sendUserJson = function (auth0Data) {
      var auth = (user.login_tokens.indexOf(req.loginToken) > 0)

      user.asJson({ auth: auth }, function (err, userJson) {
        if (err) {
          logger.error(err)
          res.status(500).send('Could not render user JSON.')
          return
        }

        if (auth0Data) {
          userJson.profileImageUrl = auth0Data.picture
        }

        res.status(200).send(userJson)
      })
    } // END function - sendUserJson
    var responseAlreadySent = false
    var handleFetchUserProfileFromAuth0 = function (err, res) {
      if (err) {
        logger.error('Auth0 Management API call getUser() returned error.')
        logger.error(err)
      }

      if (responseAlreadySent) {
        logger.debug({ profile_image_url: res.picture }, 'Auth0 Management API getUser() call returned but response already sent!')
      } else {
        logger.debug({ profile_image_url: res.picture }, 'Auth0 Management API getUser() call returned. Sending response with Auth0 data.')
        responseAlreadySent = true

        if (!res) {
          logger.error('Auth0 Management getUser() API call did not return any data.')
        }

        sendUserJson(res)
      }
    } // END function - handleFetchUserProfileFromAuth0

    if (auth0Manage) {
      logger.debug('About to call Auth0 Management API userProfile/' + user.auth0_id)
      auth0Manage.getUser(user.auth0_id, handleFetchUserProfileFromAuth0)
      setTimeout(
        function () {
          if (!responseAlreadySent) {
            logger.debug('Timing out Auth0 Management API call after %d milliseconds and sending partial response.', config.twitter.timeout_ms)
            responseAlreadySent = true
            sendUserJson()
          }
        },
        config.twitter.timeout_ms)// TODO Change config.twitter to config.auth0.timeout
    } else {
      sendUserJson()
    }
  } // END function - handleFindUserById

  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).send('Please provide user ID.')
    return
  }

  var userId = req.params.user_id

  var handleFindUserByLoginToken = function (err, user) {
    if (err) {
      logger.error(err)
      res.status(500).send('Error finding user.')
      return
    }

    if (!user) {
      res.status(401).send('User with that login token not found.')
      return
    }

    User.findOne({ id: userId }, handleFindUserById)
  } // END function - handleFindUserByLoginToken

  if (req.loginToken) {
    User.findOne({ login_tokens: { $in: [ req.loginToken ] } }, handleFindUserByLoginToken)
  } else {
    User.findOne({ id: userId }, handleFindUserById)
  }
} // END function - exports.get

exports.delete = function (req, res) {
  var handleSaveUser = function (err, user) {
    if (err) {
      logger.error(err)
      res.status(500).send('Could not sign-out user.')
      return
    }
    res.status(204).end()
  } // END function - handleSaveUser

  var handleFindUser = function (err, user) {
    if (err) {
      logger.error(err)
      res.status(500).send('Error finding user.')
      return
    }

    if (!user) {
      res.status(404).send('User not found.')
      return
    }

    var idx = user.login_tokens.indexOf(req.loginToken)
    if (idx === -1) {
      res.status(401).end()
      return
    }

    user.login_tokens.splice(idx, 1)
    user.save(handleSaveUser)
  } // END function - handleFindUser

  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).send('Please provide user ID.')
    return
  }

  var userId = req.params.user_id
  User.findOne({ id: userId }, handleFindUser)
} // END function - exports.delete

exports.put = function (req, res) {
  var body
  try {
    body = req.body
  } catch (e) {
    res.status(400).send('Could not parse body as JSON.')
    return
  }

  var handleSaveUser = function (err, user) {
    if (err) {
      logger.error(err)
      res.status(500).send('Could not update user information.')
      return
    }
    res.status(204).end()
  } // END function - handleSaveUser

  var handleFindUser = function (err, user) {
    if (err) {
      logger.error(err)
      res.status(500).send('Error finding user.')
      return
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
    user.save(handleSaveUser)
  } // END function - handleFindUser

  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).send('Please provide user ID.')
    return
  }

  var userId = req.params.user_id
  User.findOne({ id: userId }, handleFindUser)
} // END function - exports.put
