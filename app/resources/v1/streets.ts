import { randomUUID } from 'node:crypto'
import { z } from 'zod'

import { Sequence, Street, User } from '../../db/models/index.ts'
import { logger } from '../../lib/logger.ts'
import {
  ERRORS,
  asStreetJson,
  asStreetJsonBasic,
  requestIp,
} from '../../lib/util.ts'
import { updateToLatestSchemaVersion } from '../../lib/street_schema_update.js'

import type { Response } from 'express'
import type { Request as AuthedRequest } from 'express-jwt'
import type { StreetData } from '@streetmix/types'

// Briefly define the shape of legacy data so we can type-safely remove these
// properties before returning it to the client
type LegacyStreetData = StreetData & {
  undoStack?: unknown
  undoPosition?: unknown
}

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 100
const MAX_LIMIT = 200

// Check for valid page and limit values. In Express, repeated keys can
// become arrays, so only use the first value provided.
const findQuerySchema = z.object({
  creatorId: z
    .preprocess(
      (value) => (Array.isArray(value) ? value[0] : value),
      z.string()
    )
    .optional(),
  namespacedId: z
    .preprocess(
      (value) => (Array.isArray(value) ? value[0] : value),
      z.coerce.number().int().positive()
    )
    .optional(),
  page: z.preprocess(
    (value) => (Array.isArray(value) ? value[0] : value),
    z.coerce.number().int().positive().default(DEFAULT_PAGE)
  ),
  limit: z
    .preprocess(
      (value) => (Array.isArray(value) ? value[0] : value),
      z.coerce.number().int().positive().default(DEFAULT_LIMIT)
    )
    .transform((value) => Math.min(value, MAX_LIMIT)),
})

export async function post(req: AuthedRequest, res: Response) {
  let body: AuthedRequest['body']
  const street = Street.build({
    id: randomUUID(),
  })

  if (req.body) {
    try {
      body = req.body
    } catch (e) {
      res
        .status(400)
        .json({ status: 400, msg: 'Could not parse body as JSON.' })
      return
    }
    // TODO: Validation
    street.set({
      name: body.name,
      clientUpdatedAt: body.clientUpdatedAt,
      data: body.data,
      creatorIp: requestIp(req),
    })
  }

  function updateUserLastStreetId(userId: string) {
    return User.findOne({ where: { auth0Id: userId } }).then((user) => {
      if (!user) {
        throw new Error(ERRORS.USER_NOT_FOUND)
      }
      if (!user.lastStreetId) {
        return user.update({ lastStreetId: 1 })
      }
      return user.increment('lastStreetId', { by: 1 })
    })
  }

  // Keeps track of anonymous streets' "namespaced id", which is just a number
  // that counts up. The `Sequence` table is a fast lookup of that number.
  async function updateSequence() {
    let sequence: Sequence | null

    // Gets the last number in the sequence.
    try {
      sequence = await Sequence.findByPk('streets')
    } catch (err) {
      logger.error(err)
      throw new Error(ERRORS.CANNOT_CREATE_STREET, { cause: err })
    }

    // If present, increments it by 1
    if (sequence) {
      return Sequence.update(
        { seq: sequence.seq + 1 },
        { where: { id: 'streets' }, returning: true }
      )
    }

    // If not present, begin the count
    return Sequence.create({
      id: 'streets',
      seq: 1,
    })
  }

  const makeNamespacedId = async function () {
    let namespacedId: number
    try {
      if (req.auth?.sub) {
        const user = await updateUserLastStreetId(req.auth.sub)
        namespacedId = user && user.lastStreetId ? user.lastStreetId : 1
      } else {
        const sequence = await updateSequence()

        if (Array.isArray(sequence)) {
          namespacedId = sequence[1][0].seq
        } else {
          namespacedId = sequence.seq
        }
      }
    } catch (err) {
      logger.error(err)
      throw new Error(ERRORS.CANNOT_CREATE_STREET, { cause: err })
    }

    if (!namespacedId) {
      throw new Error(ERRORS.CANNOT_CREATE_STREET)
    }
    return namespacedId
  }

  const saveStreet = async function () {
    if (body && body.originalStreetId) {
      let origStreet: Street | null

      try {
        origStreet = await Street.findOne({
          where: { id: body.originalStreetId },
        })
      } catch (err) {
        logger.error(err)
        throw new Error(ERRORS.STREET_NOT_FOUND, { cause: err })
      }

      if (!origStreet || origStreet.status === 'DELETED') {
        throw new Error(ERRORS.STREET_NOT_FOUND)
      }
      const namespacedId = await makeNamespacedId()
      street.namespacedId = namespacedId

      return street.save()
    }

    const namespacedId = await makeNamespacedId()
    street.namespacedId = namespacedId
    return street.save()
  }

  const handleCreatedStreet = (s: Street) => {
    s = asStreetJson(s)
    res.header('Location', '/api/v1/streets/' + s.id)
    res.status(201).json(s)
  }

  function handleErrors(error: keyof typeof ERRORS) {
    switch (error) {
      case ERRORS.USER_NOT_FOUND:
        res.status(404).json({ status: 404, msg: 'User not found.' })
        return
      case ERRORS.STREET_NOT_FOUND:
        res.status(404).json({ status: 404, msg: 'Original street not found.' })
        return
      case ERRORS.CANNOT_CREATE_STREET:
        res
          .status(500)
          .json({ status: 500, msg: 'Could not create new street ID.' })
        return
      case ERRORS.UNAUTHORISED_ACCESS:
        res
          .status(401)
          .json({ status: 401, msg: 'User with that login token not found.' })
        return
      default:
        console.error(error)
        res.status(500).end()
    }
  }

  if (req.auth) {
    let user: User | null
    try {
      user = await User.findOne({
        where: { auth0Id: req.auth.sub },
      })
    } catch (err) {
      logger.error(err)
      handleErrors(ERRORS.USER_NOT_FOUND)
      return
    }

    if (!user) {
      handleErrors(ERRORS.UNAUTHORISED_ACCESS)
      return
    }
    street.creatorId = user ? user.id : ''

    saveStreet().then(handleCreatedStreet).catch(handleErrors)
  } else {
    saveStreet().then(handleCreatedStreet).catch(handleErrors)
  }
}

export async function del(req: AuthedRequest, res: Response) {
  if (!req.auth) {
    res.status(401).end()
    return
  }

  if (!req.params.street_id) {
    res.status(400).json({ status: 400, msg: 'Please provide street ID.' })
    return
  }

  async function deleteStreet(street: Street) {
    let user: User | null
    if (!req.auth) {
      throw new Error(ERRORS.UNAUTHORISED_ACCESS)
    }

    try {
      user = await User.findOne({
        where: { auth0Id: req.auth.sub },
      })
    } catch (err) {
      logger.error(err)
      throw new Error(ERRORS.USER_NOT_FOUND, { cause: err })
    }

    if (!user) {
      throw new Error(ERRORS.UNAUTHORISED_ACCESS)
    }

    if (!street.creatorId) {
      throw new Error(ERRORS.FORBIDDEN_REQUEST)
    }

    if (street.creatorId.toString() !== user.id.toString()) {
      throw new Error(ERRORS.FORBIDDEN_REQUEST)
    }

    street.status = 'DELETED'

    return street.save({ returning: true })
  }

  function handleErrors(error: keyof typeof ERRORS) {
    switch (error) {
      case ERRORS.USER_NOT_FOUND:
        res.status(404).json({ status: 404, msg: 'User not found.' })
        return
      case ERRORS.STREET_NOT_FOUND:
        res.status(404).json({ status: 404, msg: 'Could not find street.' })
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
  }

  let targetStreet

  try {
    targetStreet = await Street.findOne({
      where: { id: req.params.street_id },
    })
  } catch (err) {
    logger.error(err)
    handleErrors(ERRORS.STREET_NOT_FOUND)
    return
  }

  if (!targetStreet) {
    res.status(204).end()
    return
  }

  try {
    await deleteStreet(targetStreet)
    res.status(204).end()
  } catch (error) {
    handleErrors(error)
    return
  }
} // END function - export delete

export async function get(req: AuthedRequest, res: Response) {
  if (!req.params.street_id) {
    res.status(400).json({ status: 400, msg: 'Please provide street ID.' })
    return
  }
  let street

  try {
    street = await Street.findOne({
      where: { id: req.params.street_id },
    })
  } catch (err) {
    logger.error(err)
    res.status(500).json({ status: 500, msg: 'Could not find street.' })
    return
  }

  if (!street) {
    res.status(404).json({ status: 404, msg: 'Could not find street.' })
    return
  }

  if (street.status === 'DELETED') {
    res.status(410).json({ status: 410, msg: 'Could not find street.' })
    return
  }

  res.header('Last-Modified', street.updatedAt)
  if (req.method === 'HEAD') {
    res.status(204).end()
    return
  }

  // Deprecated undoStack and undoPosition values, delete if present
  const legacyStreetData = street.data as LegacyStreetData
  delete legacyStreetData.undoStack
  delete legacyStreetData.undoPosition

  // Run schema update on street
  const [isUpdated, updatedStreet] = updateToLatestSchemaVersion(
    street.data.street
  )
  if (isUpdated) {
    street.data.street = updatedStreet
    // Sequelize does not detect nested data changes, so we have to
    // manually mark the data as changed. We only save to database
    // if we've actually changed the data
    street.changed('data', true)
    // Update, but not the updated_at field
    await street.save({ silent: true })
  }

  const streetJson = asStreetJson(street)

  res.set('Access-Control-Allow-Origin', '*')
  res.set('Location', '/api/v1/streets/' + street.id)
  res.status(200).json(streetJson)
} // END function - export get

export async function find(req: AuthedRequest, res: Response) {
  const result = findQuerySchema.safeParse(req.query)

  if (!result.success) {
    if (result.error instanceof z.ZodError) {
      res
        .status(400)
        .json({ status: 400, errors: z.flattenError(result.error).fieldErrors })
    } else {
      res.status(400).json({ status: 400, msg: 'Bad request.' })
    }
    return
  }

  const { creatorId, namespacedId, page, limit } = result.data
  const offset = (page - 1) * limit

  const findStreetWithCreatorId = async function (creatorId: string) {
    let user
    try {
      user = await User.findOne({ where: { id: creatorId } })
    } catch (err) {
      logger.error(err)
      handleErrors(ERRORS.USER_NOT_FOUND)
      return
    }

    if (!user) {
      handleErrors(ERRORS.USER_NOT_FOUND)
      return
    }
    return Street.findOne({
      where: { namespacedId, creatorId: user.id },
    })
  } // END function - findStreetWithCreatorId

  const findStreetWithNamespacedId = async function (namespacedId: number) {
    return Street.findOne({
      where: { namespacedId, creatorId: null },
    })
  }

  const findStreets = async function (offset: number, limit: number) {
    return Street.findAndCountAll({
      where: { status: 'ACTIVE' },
      order: [['updatedAt', 'DESC']],
      offset,
      limit,
    })
  } // END function - findStreets

  // TODO: There is a bug here where errors thrown by `new Error` will have
  // its value in `error.message`, not error! We should figure out how to
  // make this be consistent
  function handleErrors(error: keyof typeof ERRORS) {
    switch (error) {
      case ERRORS.USER_NOT_FOUND:
        res.status(404).json({ status: 404, msg: 'Creator not found.' })
        return
      case ERRORS.STREET_NOT_FOUND:
        res.status(404).json({ status: 404, msg: 'Could not find street.' })
        return
      case ERRORS.STREET_DELETED:
        res.status(410).json({ status: 410, msg: 'Could not find street.' })
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

  const handleFindStreet = function (street: Street | undefined) {
    if (street === undefined) {
      handleErrors(ERRORS.STREET_NOT_FOUND)
      return
    }

    if (street.status === 'DELETED') {
      handleErrors(ERRORS.STREET_DELETED)
      return
    }

    res.set('Access-Control-Allow-Origin', '*')
    res.set('Location', '/api/v1/streets/' + street.id)
    res.set('Content-Length', '0')
    res.status(307).end()
  } // END function - handleFindStreet

  const handleFindStreets = function (results) {
    const totalNumStreets =
      typeof results.count === 'number' ? results.count : results.count.length

    // There is a bug where sometimes street data is non-existent for an
    // unknown reason. Skip over so these because sending this is malformed data
    const streets = results.rows.filter(
      (street) => typeof street.data !== 'undefined'
    )
    const totalPages =
      totalNumStreets > 0 ? Math.ceil(totalNumStreets / limit) : 0

    res.status(200).json({
      streets: streets.map(asStreetJsonBasic),
      pagination: {
        page,
        limit,
        total: totalNumStreets,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })
  } // END function - handleFindStreets

  if (creatorId) {
    try {
      const street = await findStreetWithCreatorId(creatorId)
      if (!street) {
        handleErrors(ERRORS.STREET_NOT_FOUND)
        return
      }
      handleFindStreet(street)
    } catch (err) {
      handleErrors(err)
    }
  } else if (namespacedId) {
    findStreetWithNamespacedId(namespacedId)
      .then(handleFindStreet)
      .catch(handleErrors)
  } else {
    findStreets(offset, limit).then(handleFindStreets).catch(handleErrors)
  }
}

export async function put(req: AuthedRequest, res: Response) {
  let body

  if (req.body) {
    try {
      body = req.body
    } catch (e) {
      res
        .status(400)
        .json({ status: 400, msg: 'Could not parse body as JSON.' })
      return
    }
  } else {
    res
      .status(400)
      .json({ status: 400, msg: 'Street information not specified.' })
    return
  }

  if (!req.params.street_id) {
    res.status(400).json({ status: 400, msg: 'Please provide street ID.' })
    return
  }

  function handleErrors(error: keyof typeof ERRORS) {
    switch (error) {
      case ERRORS.USER_NOT_FOUND:
        res.status(404).json({ status: 404, msg: 'Creator not found.' })
        return
      case ERRORS.STREET_NOT_FOUND:
        res.status(404).json({ status: 404, msg: 'Original street not found.' })
        return
      case ERRORS.STREET_DELETED:
        res.status(410).json({ status: 410, msg: 'Could not find street.' })
        return
      case ERRORS.CANNOT_UPDATE_STREET:
        res.status(500).json({ status: 500, msg: 'Could not update street.' })
        return
      case ERRORS.UNAUTHORISED_ACCESS:
        res.status(401).json({ status: 401, msg: 'User is not signed-in.' })
        return
      case ERRORS.FORBIDDEN_REQUEST:
        res.status(403).json({
          status: 403,
          msg: 'Signed-in user cannot update this street.',
        })
        return
      default:
        res.status(500).end()
    }
  } // END function - handleErrors

  async function updateStreetData(street) {
    // This function seems to allow for partial updates (e.g. if client doesn't
    // provide `data`, keep the original.) The previous logic (using OR, for
    // `data` and `clientUpdatedAt`, breaks `name` because this value allows
    // `null` as a valid update -- this meant unnaming streets would be
    // ignored, and the previous street name would be retained incorrectly.
    // We can preserve the existing/desired behavior (even if the client
    // doesn't take advantage of it) by updating `street.name` only if the
    // `name` property is actually defined in the payload.
    if (typeof body.name !== 'undefined') {
      street.name = body.name
    }
    street.data = body.data || street.data
    street.clientUpdatedAt =
      body.clientUpdatedAt || street.clientUpdatedAt || ''

    if (body.originalStreetId) {
      let origStreet: Street | null
      try {
        origStreet = await Street.findOne({
          where: { id: body.originalStreetId },
        })
      } catch (err) {
        logger.error(err)
        handleErrors(ERRORS.CANNOT_UPDATE_STREET)
      }

      if (!origStreet) {
        throw new Error(ERRORS.STREET_NOT_FOUND)
      }
      street.originalStreetId = origStreet.id
    }
    return street.save({ returning: true })
  } // END function - updateStreetData

  let street
  try {
    street = await Street.findOne({
      where: { id: req.params.street_id },
    })
  } catch (err) {
    logger.error(err)
    handleErrors(ERRORS.CANNOT_UPDATE_STREET)
    return
  }

  async function updateStreetWithUser(street, user) {
    if (!user) {
      throw new Error(ERRORS.UNAUTHORISED_ACCESS)
    }

    if (!street.creatorId) {
      throw new Error(ERRORS.FORBIDDEN_REQUEST)
    }

    if (street.creatorId.toString() !== user.id.toString()) {
      throw new Error(ERRORS.FORBIDDEN_REQUEST)
    }
    return updateStreetData(street)
  } // END function - updateStreetWithUser

  if (!street) {
    handleErrors(ERRORS.STREET_NOT_FOUND)
    return
  }

  if (street.status === 'DELETED') {
    handleErrors(ERRORS.STREET_DELETED)
    return
  }

  if (!street.creatorId) {
    try {
      await updateStreetData(street)
      res.status(204).end()
    } catch (error) {
      handleErrors(error)
      return
    }
  } else {
    if (!req.auth) {
      res.status(401).end()
      return
    }

    const user = await User.findOne({
      where: { auth0Id: req.auth.sub },
    })

    const isOwner = user && user.id === street.creatorId
    if (!isOwner) {
      res.status(401).end()
      return
    }

    try {
      await updateStreetWithUser(street, user)
      res.status(204).end()
    } catch (error) {
      handleErrors(error)
      return
    }
  }
} // END function - export put
