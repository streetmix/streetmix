import { Street, User } from '../../db/models/index.ts'
import { asStreetJsonBasic, ERRORS } from '../../lib/util.ts'
import { logger } from '../../lib/logger.ts'

import type { Response } from 'express'
import type { Request as AuthedRequest } from 'express-jwt'

const errorResponses: Partial<
  Record<keyof typeof ERRORS, { status: number; msg: string }>
> = {
  // Not found
  USER_NOT_FOUND: { status: 404, msg: 'User not found.' },
  STREET_NOT_FOUND: { status: 404, msg: 'Street not found.' },
  STREET_DELETED: { status: 410, msg: 'Street not found.' },

  // Authorization errors
  UNAUTHORISED_ACCESS: { status: 401, msg: 'User must be signed in.' },
  FORBIDDEN_REQUEST: {
    status: 403,
    msg: 'User cannot delete this street.',
  },

  // Server or database failures
  CANNOT_GET_STREET: {
    status: 500,
    msg: 'Could not retrieve streets for user.',
  },
  CANNOT_UPDATE_STREET: { status: 500, msg: 'Could not update streets.' },
  CANNOT_GET_USER: { status: 500, msg: 'Error finding user.' },

  // Catch-all
  INTERNAL_ERROR: { status: 500, msg: 'Server failure.' },
}

function sendError(res: Response, error: keyof typeof ERRORS) {
  const response = errorResponses[error] ?? errorResponses.INTERNAL_ERROR

  if (!response) {
    res.status(500).json({ status: 500, msg: 'Server failure.' })
    return
  }

  if (!errorResponses[error]) {
    logger.error(error)
  }

  res.status(response.status).json({
    status: response.status,
    msg: response.msg,
  })
}

export async function get(req: AuthedRequest, res: Response) {
  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).json({ status: 400, msg: 'Please provide user ID.' })
    return
  }

  let user
  try {
    user = await User.findOne({ where: { id: req.params.user_id } })
  } catch (err) {
    logger.error(err)
    sendError(res, ERRORS.CANNOT_GET_USER)
    return
  }

  if (!user) {
    sendError(res, ERRORS.USER_NOT_FOUND)
    return
  }

  let streets: Street[]
  try {
    streets = await Street.findAll({
      where: { creatorId: user.id, status: 'ACTIVE' },
      order: [['updatedAt', 'DESC']],
      limit: 100,
    })
  } catch (err) {
    logger.error(err)
    sendError(res, ERRORS.CANNOT_GET_STREET)
    return
  }

  res.status(200).json({
    // Remove properties that should not be sent to client
    streets: streets.map(asStreetJsonBasic),
  })
}

export async function del(req: AuthedRequest, res: Response) {
  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).json({ status: 400, msg: 'Please provide user ID.' })
    return
  } else if (!req.auth) {
    sendError(res, ERRORS.UNAUTHORISED_ACCESS)
    return
  }

  let requestUser: User | null

  try {
    requestUser = await User.findOne({ where: { auth0Id: req.auth.sub } })
  } catch (error) {
    logger.error(error)
    sendError(res, ERRORS.CANNOT_GET_USER)
    return
  }

  if (!requestUser) {
    sendError(res, ERRORS.UNAUTHORISED_ACCESS)
    return
  }

  const targetUserId = req.params.user_id
  let targetUser: User | null
  const requestUserIsAdmin =
    requestUser.roles && requestUser.roles.indexOf('ADMIN') !== -1

  if (targetUserId !== requestUser.id) {
    if (!requestUserIsAdmin) {
      sendError(res, ERRORS.FORBIDDEN_REQUEST)
      return
    }

    try {
      targetUser = await User.findOne({ where: { id: targetUserId } })
    } catch (error) {
      logger.error(error)
      sendError(res, ERRORS.CANNOT_GET_USER)
      return
    }

    if (!targetUser) {
      sendError(res, ERRORS.USER_NOT_FOUND)
      return
    }
  } else {
    targetUser = requestUser
  }

  try {
    await Street.update(
      { status: 'DELETED' },
      {
        where: {
          creatorId: targetUser.id,
          status: 'ACTIVE',
        },
      }
    )
  } catch (error) {
    logger.error(error)
    sendError(res, ERRORS.CANNOT_UPDATE_STREET)
    return
  }

  res.status(204).end()
}
