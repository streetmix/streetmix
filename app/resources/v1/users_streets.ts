import { Street, User } from '../../db/models/index.ts'
import { asStreetJsonBasic, ERRORS } from '../../lib/util.ts'
import { logger } from '../../lib/logger.ts'

import type { Response } from 'express'
import type { Request as AuthedRequest } from 'express-jwt'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 100
const MAX_LIMIT = 200

// TODO: consolidate status codes and response messages with ERRORS object
// Allow for custom (more specific) error messages where appropriate.
type ErrorCode = (typeof ERRORS)[keyof typeof ERRORS]

const errorResponses: Partial<
  Record<ErrorCode, { status: number; msg: string }>
> = {
  // Not found
  USER_NOT_FOUND: { status: 404, msg: 'User not found.' },
  STREET_NOT_FOUND: { status: 404, msg: 'Street not found.' },
  STREET_DELETED: { status: 410, msg: 'Street not found.' },

  // Authorization errors
  UNAUTHORISED_ACCESS: { status: 401, msg: 'User must be signed in.' },
  FORBIDDEN_REQUEST: {
    status: 403,
    msg: 'User cannot delete streets for another user.',
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

function sendError(res: Response, error: ErrorCode) {
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

// Check for valid page and limit values. In Express, repeated keys can
// become arrays, so this gets checked too.
function parsePositiveInteger(value: unknown): number | null {
  const rawValue = Array.isArray(value) ? value[0] : value

  if (typeof rawValue !== 'string') return null

  const parsedValue = Number.parseInt(rawValue, 10)
  if (!Number.isInteger(parsedValue) || parsedValue < 1) return null

  return parsedValue
}

export async function get(req: AuthedRequest, res: Response) {
  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).json({ status: 400, msg: 'Please provide user ID.' })
    return
  }

  const parsedPage = parsePositiveInteger(req.query.page)
  const parsedLimit = parsePositiveInteger(req.query.limit)

  if (
    (req.query.page !== undefined && parsedPage === null) ||
    (req.query.limit !== undefined && parsedLimit === null)
  ) {
    res.status(400).json({
      status: 400,
      msg: 'page and limit must be positive integers.',
    })
    return
  }

  const page = parsedPage ?? DEFAULT_PAGE
  const limit = Math.min(parsedLimit ?? DEFAULT_LIMIT, MAX_LIMIT)
  const offset = (page - 1) * limit

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
  let total: number
  try {
    const result = await Street.findAndCountAll({
      where: { creatorId: user.id, status: 'ACTIVE' },
      order: [['updatedAt', 'DESC']],
      limit,
      offset,
    })

    streets = result.rows
    total = Array.isArray(result.count) ? result.count.length : result.count
  } catch (err) {
    logger.error(err)
    sendError(res, ERRORS.CANNOT_GET_STREET)
    return
  }

  const totalPages = total > 0 ? Math.ceil(total / limit) : 0

  res.status(200).json({
    // Remove properties that should not be sent to client
    streets: streets.map(asStreetJsonBasic),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
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
