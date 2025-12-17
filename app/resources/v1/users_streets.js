import models from '../../db/models/index.js'
import { ERRORS } from '../../lib/util.js'
import logger from '../../lib/logger.js'

const { User, Street } = models

function handleErrors(error, res) {
  switch (error) {
    case ERRORS.USER_NOT_FOUND:
      res.status(404).json({ status: 404, msg: 'Creator not found.' })
      break
    case ERRORS.STREET_NOT_FOUND:
      res.status(404).json({ status: 404, msg: 'Could not find streets.' })
      break
    case ERRORS.STREET_DELETED:
      res.status(410).json({ status: 410, msg: 'Could not find street.' })
      break
    case ERRORS.CANNOT_GET_STREET:
      res
        .status(500)
        .json({ status: 500, msg: 'Could not find streets for user.' })
      break
    case ERRORS.UNAUTHORISED_ACCESS:
      res.status(401).json({ status: 401, msg: 'User is not signed-in.' })
      break
    case ERRORS.FORBIDDEN_REQUEST:
      res.status(403).json({
        status: 403,
        msg: 'Signed-in user cannot delete this street.',
      })
      break
    default:
      // Log unknown error.
      logger.error(error)
      res.status(500).end()
  }
} // END function - handleErrors

export async function get(req, res) {
  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).json({ status: 400, msg: 'Please provide user ID.' })
    return
  }

  const findUserStreets = async function (userId) {
    let streets
    try {
      streets = await Street.findAll({
        where: { creatorId: userId, status: 'ACTIVE' },
        order: [['updatedAt', 'DESC']],
      })
    } catch (err) {
      logger.error(err)
      handleErrors(ERRORS.CANNOT_GET_STREET)
    }

    if (!streets) {
      throw new Error(ERRORS.STREET_NOT_FOUND)
    }

    return streets
  } // END function - handleFindUserstreets

  const handleFindUserStreets = function (streets) {
    const json = { streets }
    res.status(200).json(json).end()
  } // END function - handleFindUserStreets

  function handleErrors(error) {
    switch (error) {
      case ERRORS.USER_NOT_FOUND:
        res.status(404).json({ status: 404, msg: 'Creator not found.' })
        return
      case ERRORS.STREET_NOT_FOUND:
        res.status(404).json({ status: 404, msg: 'Could not find streets.' })
        return
      case ERRORS.STREET_DELETED:
        res.status(410).json({ status: 410, msg: 'Could not find street.' })
        return
      case ERRORS.CANNOT_GET_STREET:
        res
          .status(500)
          .json({ status: 500, msg: 'Could not find streets for user.' })
        return
      case ERRORS.UNAUTHORISED_ACCESS:
        res.status(401).json({ status: 401, msg: 'User is not signed-in.' })
        return
      case ERRORS.FORBIDDEN_REQUEST:
        res.status(403).json({
          status: 403,
          msg: 'Signed-in user cannot delete this street.',
        })
        return
      default:
        res.status(500).end()
    }
  } // END function - handleErrors

  let user
  try {
    user = await User.findOne({ where: { id: req.params.user_id } })
  } catch (err) {
    logger.error(err)
    handleErrors(ERRORS.CANNOT_GET_STREET)
    return
  }

  if (!user) {
    res.status(404).json({ status: 404, msg: 'Could not find user.' })
    return
  }
  try {
    const streets = await findUserStreets(user.id)
    handleFindUserStreets(streets)
  } catch (err) {
    console.error(err)
    handleErrors(err)
  }
}

export async function del(req, res) {
  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).json({ status: 400, msg: 'Please provide user ID.' })
    return
  } else if (!req.auth) {
    res
      .status(400)
      .json({ status: 400, msg: 'Please provide a logged in user' })
    return
  }

  let requestUser

  try {
    requestUser = await User.findOne({ where: { auth0_id: req.auth.sub } })
  } catch (error) {
    logger.error(error)
    res.status(500).json({ status: 500, msg: 'Error finding user.' })
    return
  }

  if (!requestUser) {
    res.status(401).json({ status: 401, msg: 'User not found.' })
    return
  }

  // Is requesting user logged in?
  if (!requestUser) {
    res.status(401).end()
    return
  }

  const targetUserId = req.params.user_id
  let targetUser
  const requestUserIsAdmin =
    requestUser.roles && requestUser.roles.indexOf('ADMIN') !== -1
  if (targetUserId !== requestUser.id) {
    if (!requestUserIsAdmin) {
      res.status(401).json({
        status: 401,
        msg: 'Unable to delete streets by another user.',
      })
      return
    }

    try {
      targetUser = await User.findOne({ where: { id: targetUserId } })
    } catch (error) {
      logger.error(error)
      res.status(500).json({ status: 500, msg: 'Error finding user.' })
      return
    }

    if (!targetUser) {
      res.status(401).json({ status: 401, msg: 'User not found.' })
      return
    }
  } else {
    targetUser = requestUser
  }

  const handleRemoveUserStreets = function (error, _streets) {
    if (error) {
      logger.error(error)
      handleErrors(ERRORS.CANNOT_UPDATE_STREET, res)
      return
    }

    res.status(204).end()
  }

  Street.update(
    { creatorId: targetUser.id, status: 'ACTIVE' },
    { status: 'DELETED' },
    { multi: true },
    handleRemoveUserStreets
  )
}
