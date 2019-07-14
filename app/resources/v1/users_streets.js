const async = require('async')

const User = require('../../models/user.js')
const Street = require('../../models/street.js')
const logger = require('../../../lib/logger.js')()
const { ERRORS } = require('../../../lib/util')

function handleErrors (error, res) {
  switch (error) {
    case ERRORS.USER_NOT_FOUND:
      res.status(404).send('Creator not found.')
      break
    case ERRORS.STREET_NOT_FOUND:
      res.status(404).send('Could not find streets.')
      break
    case ERRORS.STREET_DELETED:
      res.status(410).send('Could not find street.')
      break
    case ERRORS.CANNOT_GET_STREET:
      res.status(500).send('Could not find streets for user.')
      break
    case ERRORS.UNAUTHORISED_ACCESS:
      res.status(401).send('User is not signed-in.')
      break
    case ERRORS.FORBIDDEN_REQUEST:
      res.status(403).send('Signed-in user cannot delete this street.')
      break
    default:
      // Log unknown error.
      logger.error(error)
      res.status(500).end()
  }
} // END function - handleErrors

exports.get = async function (req, res) {
  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).send('Please provide user ID.')
  }

  const findUserStreets = async function (userId) {
    let streets

    try {
      streets = await Street.find({ creator_id: userId, status: 'ACTIVE' })
        .sort({ updated_at: 'descending' })
        .exec()
    } catch (err) {
      logger.error(err)
      handleErrors(ERRORS.CANNOT_GET_STREET, res)
    }

    if (!streets) {
      throw new Error(ERRORS.STREET_NOT_FOUND)
    }

    return streets
  } // END function - handleFindUserstreets

  const handleFindUserStreets = function (streets) {
    const json = { streets: [] }

    async.map(
      streets,
      function (street, callback) { street.asJson(callback) },
      function (err, results) {
        if (err) {
          logger.error(err)
          res.status(500).send('Could not append street.')
          return
        }

        json.streets = results
        res.status(200).send(json)
      }) // END - async.map
  } // END function - handleFindUserStreets

  let user

  try {
    user = await User.findOne({ id: req.params.user_id })
  } catch (err) {
    logger.error(err)
    handleErrors(ERRORS.CANNOT_GET_STREET, res)
  }

  if (!user) {
    res.status(404).send('Could not find user.')
    return
  }

  findUserStreets(user._id)
    .then(handleFindUserStreets)
    .catch((error) => handleErrors(error, res))
}

exports.delete = async function (req, res) {
  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).send('Please provide user ID.')
  } else if (!req.loginToken) {
    res.status(400).send('Please provid a login token.')
  }

  const userId = req.userId
  let requestUser

  try {
    requestUser = await User.findOne({ id: userId })
  } catch (error) {
    logger.error(error)
    res.status(500).send('Error finding user.')
  }

  if (!requestUser) {
    res.status(401).send('User not found.')
    return
  }

  // Is requesting user logged in?
  if (requestUser.login_tokens.indexOf(req.loginToken) === -1) {
    res.status(401).end()
    return
  }

  const targetUserId = req.params.user_id
  let targetUser

  if (targetUserId !== userId) {
    try {
      targetUser = await User.findOne({ id: targetUserId })
    } catch (error) {
      logger.error(error)
      res.status(500).send('Error finding user.')
    }

    if (!targetUser) {
      res.status(401).send('User not found.')
      return
    }
  } else {
    targetUser = requestUser
  }

  const handleRemoveUserStreets = function (error, streets) {
    if (error) {
      logger.error(error)
      handleErrors(ERRORS.CANNOT_UPDATE_STREET, res)
    }

    res.status(204).end()
  }

  Street.update({ creator_id: targetUser._id, status: 'ACTIVE' }, { status: 'DELETED' }, { multi: true }, handleRemoveUserStreets)
}
