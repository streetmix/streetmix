var mongoose = require('mongoose'),
    config = require('config'),
    uuid = require('uuid'),
    twitter = require('twitter'),
    db = require('../../../lib/db.js'),
    User = require('../../models/user.js'),
    logger = require('../../../lib/logger.js')();

exports.post = function(req, res) {

  var loginToken = null

  var handleTwitterSignIn = function(twitterCredentials) {

    // TODO: Call Twitter API with OAuth access credentials to make sure they are valid

    var handleCreateUser = function(err, user) {
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

    var handleUpdateUser = function(err, user) {

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

    var handleFindUser = function(err, user) {

      if (err) {
        logger.error(err)
        res.status(500).send('Error finding user with Twitter ID.')
        return
      }

      loginToken = uuid.v1()
      if (!user) {
        var u = new User({
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
        user.id = twitterCredentials.screenName,
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

  var body
  try {
    body = req.body
  } catch (e) {
    res.status(400).send('Could not parse body as JSON.')
    return
  }

  if (body.hasOwnProperty('twitter')) {

    // TODO: Validation

    handleTwitterSignIn(body.twitter)
  } else {
    res.status(400).send('Unknown sign-in method used.')
  }

} // END function - exports.post

exports.get = function(req, res) {

  var handleFindUserById = function(err, user) {

    if (!user) {
      res.status(404).send('User not found.')
      return
    }

    var twitterApiClient
      try {

          twitterApiClient = new twitter({
            consumer_key: config.twitter.oauth_consumer_key,
            consumer_secret: config.twitter.oauth_consumer_secret,
            access_token_key: user.twitter_credentials.access_token_key,
            access_token_secret: user.twitter_credentials.access_token_secret
          })

          console.log(twitterApiClient)

      } catch (e) {
        logger.error('Could not initialize Twitter API client. Error:')
        logger.error(e)
      }

    var sendUserJson = function(twitterData) {

      var auth = (user.login_tokens.indexOf(req.loginToken) > 0)

      user.asJson({ auth: auth }, function(err, userJson) {

        if (err) {
          logger.error(err)
          res.status(500).send('Could not render user JSON.')
          return
        }

        if (twitterData) {
          userJson.profileImageUrl = twitterData.profile_image_url
        }

        res.status(200).send(userJson)

      })

    } // END function - sendUserJson

    var responseAlreadySent = false
    var handleFetchUserProfileFromTwitter = function(data) {
      console.log(data)

      if (responseAlreadySent) {
        logger.debug({ profile_image_url: data.profile_image_url }, 'Twitter API users/show call returned but response already sent!')
      } else {

        logger.debug({ profile_image_url: data.profile_image_url }, 'Twitter API users/show call returned. Sending response with Twitter data.')
        responseAlreadySent = true

        if (!data) {
          logger.error('Twitter API call users/show did not return any data.')
        }

        sendUserJson(data)

      }

    } // END function - handleFetchUserProfileFromTwitter

    if (twitterApiClient) {
      logger.debug('About to call Twitter API: /users/show.json?user_id=' + user.twitter_id)
      twitterApiClient.get('/users/show.json', { user_id: user.twitter_id }, handleFetchUserProfileFromTwitter)
      setTimeout(
        function() {
          if (!responseAlreadySent) {
              logger.debug('Timing out Twitter API call after %d milliseconds and sending partial response.', config.twitter.timeout_ms)
              responseAlreadySent = true
              sendUserJson()
          }
        },
        config.twitter.timeout_ms)
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

  var handleFindUserByLoginToken = function(err, user) {

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

exports.delete = function(req, res) {

  var handleSaveUser = function(err, user) {

    if (err) {
      logger.error(err)
      res.status(500).send('Could not sign-out user.')
      return
    }
    res.status(204).end()

  } // END function - handleSaveUser

  var handleFindUser = function(err, user) {

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

exports.put = function(req, res) {

  var body
  try {
    body = req.body
  } catch (e) {
    res.status(400).send('Could not parse body as JSON.')
    return
  }

  var handleSaveUser = function(err, user) {

    if (err) {
      logger.error(err)
      res.status(500).send('Could not update user information.')
      return
    }
    res.status(204).end()

  } // END function - handleSaveUser

  var handleFindUser = function(err, user) {

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
