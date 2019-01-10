
const config = require('config')
const uuid = require('uuid')
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
  // Flag error if user is not authenticated (loginToken)
  if (!req.loginToken) {
    res.status(400).send('Please provide login token.')
    return
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

    return requestUser
  }

  const findStreetmixUsers = async function () {
    let users

    try {
      users = await User.find({})
    } catch (err) {
      logger.error(err)
      throw new Error(ERRORS.CANNOT_GET_USER)
    }

    if (!users) {
      throw new Error(ERRORS.UNAUTHORISED_ACCESS)
    }

    return users
  }

  const handleFindUsers = function (users) {
    let usersArray = []

    const getUserJson = function (user) {
      const auth = req.loginToken && (user.login_tokens.indexOf(req.loginToken) !== -1 || requestUser.roles.includes('ADMIN'))

      user.asJson({ auth: auth }, function (err, userJson) {
        if (err) {
          logger.error(err)
          res.status(500).send('Could not render user JSON.')
          return
        }

        userJson.profileImageUrl = user.profile_image_url
        usersArray.push(userJson)
      })
    }

    users.forEach((user) => { getUserJson(user) })
    res.status(200).send(usersArray)
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

  findUserByLoginToken(req.loginToken)
    .then(findStreetmixUsers)
    .then(handleFindUsers)
    .catch(handleError)

} // END function - exports.get