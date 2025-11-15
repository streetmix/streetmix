import { randomUUID } from 'node:crypto'

import models from '../../db/models/index.js'
import logger from '../../lib/logger.js'
import { ERRORS, asStreetJson } from '../../lib/util.js'
import { updateToLatestSchemaVersion } from '../../lib/street_schema_update.js'

const { User, Street, Sequence } = models

export async function post (req, res) {
  let body
  const street = {}
  street.id = randomUUID()
  const requestIp = function (req) {
    if (req.headers['x-forwarded-for'] !== undefined) {
      return req.headers['x-forwarded-for'].split(', ')[0]
    } else {
      return req.connection.remoteAddress
    }
  }

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
    street.name = body.name
    street.clientUpdatedAt = body.clientUpdatedAt
    street.data = body.data
    street.creatorIp = requestIp(req)
  }

  function updateUserLastStreetId (userId) {
    return User.findOne({ where: { auth0_id: userId } }).then((user) => {
      if (!user.lastStreetId) {
        return user.update({ lastStreetId: 1 })
      }
      return user.increment('lastStreetId', { by: 1 })
    })
  }

  async function updateSequence () {
    let sequence
    try {
      sequence = await Sequence.findByPk('streets')
    } catch (err) {
      logger.error(err)
      throw new Error(ERRORS.CANNOT_CREATE_STREET)
    }
    if (sequence) {
      return Sequence.update(
        { seq: sequence.seq + 1 },
        { where: { id: 'streets' }, returning: true }
      )
    }
    return Sequence.create({
      id: 'streets',
      seq: 1
    })
  }

  const makeNamespacedId = async function () {
    let namespacedId
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
      throw new Error(ERRORS.CANNOT_CREATE_STREET)
    }

    if (!namespacedId) {
      throw new Error(ERRORS.CANNOT_CREATE_STREET)
    }
    return namespacedId
  }

  const saveStreet = async function () {
    if (body && body.originalStreetId) {
      let origStreet
      try {
        origStreet = await Street.findOne({
          where: { id: body.originalStreetId }
        })
      } catch (err) {
        logger.error(err)
        throw new Error(ERRORS.STREET_NOT_FOUND)
      }

      if (!origStreet || origStreet.status === 'DELETED') {
        throw new Error(ERRORS.STREET_NOT_FOUND)
      }
      const namespacedId = await makeNamespacedId()
      street.namespacedId = namespacedId

      return Street.create(street)
    }

    const namespacedId = await makeNamespacedId()
    street.namespacedId = namespacedId
    return Street.create(street)
  }

  const handleCreatedStreet = (s) => {
    s = asStreetJson(s)
    res.header('Location', '/api/v1/streets/' + s.id)
    res.status(201).json(s)
  }

  function handleErrors (error) {
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
        res.status(500).end()
    }
  }

  if (req.auth) {
    let user
    try {
      user = await User.findOne({
        where: { auth0_id: req.auth.sub }
      })
    } catch (err) {
      logger.error(err)
      handleErrors(ERRORS.USER_NOT_FOUND)
    }

    if (!user) {
      handleErrors(ERRORS.UNAUTHORISED_ACCESS)
    }
    street.creatorId = user ? user.id : ''

    saveStreet().then(handleCreatedStreet).catch(handleErrors)
  } else {
    saveStreet().then(handleCreatedStreet).catch(handleErrors)
  }
}

export async function del (req, res) {
  if (!req.auth) {
    res.status(401).end()
    return
  }

  if (!req.params.street_id) {
    res.status(400).json({ status: 400, msg: 'Please provide street ID.' })
    return
  }

  async function deleteStreet (street) {
    let user
    if (!req.auth) {
      throw new Error(ERRORS.UNAUTHORISED_ACCESS)
    }

    try {
      user = await User.findOne({
        where: { auth0_id: req.auth.sub }
      })
    } catch (err) {
      logger.error(err)
      throw new Error(ERRORS.USER_NOT_FOUND)
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

  function handleErrors (error) {
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
          msg: 'Signed-in user cannot delete this street.'
        })
        return
      default:
        res.status(500).end()
    }
  }

  let targetStreet

  try {
    targetStreet = await Street.findOne({
      where: { id: req.params.street_id }
    })
  } catch (err) {
    logger.error(err)
    handleErrors(ERRORS.STREET_NOT_FOUND)
  }

  if (!targetStreet) {
    res.status(204).end()
    return
  }

  deleteStreet(targetStreet)
    .then((street) => {
      res.status(204).end()
    })
    .catch(handleErrors)
} // END function - export delete

export async function get (req, res) {
  if (!req.params.street_id) {
    res.status(400).json({ status: 400, msg: 'Please provide street ID.' })
    return
  }
  let street

  try {
    street = await Street.findOne({
      where: { id: req.params.street_id }
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
  delete street.data.undoStack
  delete street.data.undoPosition

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

export async function find (req, res) {
  const creatorId = req.query.creatorId
  const namespacedId = req.query.namespacedId
  const start = (req.query.start && Number.parseInt(req.query.start, 10)) || 0
  const count = (req.query.count && Number.parseInt(req.query.count, 10)) || 20
  const findStreetWithCreatorId = async function (creatorId) {
    let user
    try {
      user = await User.findOne({ where: { id: creatorId } })
    } catch (err) {
      logger.error(err)
      handleErrors(ERRORS.USER_NOT_FOUND)
    }

    if (!user) {
      handleErrors(ERRORS.USER_NOT_FOUND)
      return
    }
    return Street.findOne({
      where: { namespacedId, creatorId: user.id }
    })
  } // END function - findStreetWithCreatorId

  const findStreetWithNamespacedId = async function (namespacedId) {
    return Street.findOne({
      where: { namespacedId, creatorId: null }
    })
  }

  const findStreets = async function (start, count) {
    return Street.findAndCountAll({
      where: { status: 'ACTIVE' },
      order: [['updatedAt', 'DESC']],
      offset: start,
      limit: count
    })
  } // END function - findStreets

  // TODO: There is a bug here where errors thrown by `new Error` will have
  // its value in `error.message`, not error! We should figure out how to
  // make this be consistent
  function handleErrors (error) {
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
          msg: 'Signed-in user cannot delete this street.'
        })
        return
      default:
        res.status(500).end()
    }
  } // END function - handleErrors

  const handleFindStreet = function (street) {
    street = asStreetJson(street)
    if (!street) {
      handleErrors(ERRORS.STREET_NOT_FOUND)
    }

    if (street.status === 'DELETED') {
      handleErrors(ERRORS.STREET_DELETED)
    }
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Location', '/api/v1/streets/' + street.id)
    res.set('Content-Length', 0)
    res.status(307).end()
  } // END function - handleFindStreet

  const handleFindStreets = function (results) {
    const totalNumStreets = results.count
    const streets = results.rows

    const selfUri = '/api/v1/streets?start=' + start + '&count=' + count

    const json = {
      meta: {
        links: {
          self: selfUri
        }
      },
      streets
    }

    if (start > 0) {
      let prevStart, prevCount
      if (start >= count) {
        prevStart = start - count
        prevCount = count
      } else {
        prevStart = 0
        prevCount = start
      }
      json.meta.links.prev =
        '/api/v1/streets?start=' + prevStart + '&count=' + prevCount
    }

    if (start + streets.length < totalNumStreets) {
      const nextStart = start + count
      const nextCount = Math.min(
        count,
        totalNumStreets - start - streets.length
      )
      json.meta.links.next =
        '/api/v1/streets?start=' + nextStart + '&count=' + nextCount
    }
    res.status(200).send(json)
  } // END function - handleFindStreets

  if (creatorId) {
    try {
      const street = await findStreetWithCreatorId(creatorId)
      if (!street) {
        handleErrors(ERRORS.STREET_NOT_FOUND)
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
    findStreets(start, count).then(handleFindStreets).catch(handleErrors)
  }
}

export async function put (req, res) {
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

  function handleErrors (error) {
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
          msg: 'Signed-in user cannot update this street.'
        })
        return
      default:
        res.status(500).end()
    }
  } // END function - handleErrors

  async function updateStreetData (street) {
    street.name = body.name || street.name
    street.data = body.data || street.data
    street.clientUpdatedAt =
      body.clientUpdatedAt || street.clientUpdatedAt || ''

    if (body.originalStreetId) {
      let origStreet
      try {
        origStreet = await Street.findOne({
          where: { id: body.originalStreetId }
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
      where: { id: req.params.street_id }
    })
  } catch (err) {
    logger.error(err)
    handleErrors(ERRORS.CANNOT_UPDATE_STREET)
  }

  async function updateStreetWithUser (street, user) {
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
    updateStreetData(street)
      .then((street) => {
        res.status(204).end()
      })
      .catch(handleErrors)
  } else {
    if (!req.auth) {
      res.status(401).end()
      return
    }

    const user = await User.findOne({
      where: { auth0_id: req.auth.sub }
    })

    const isOwner = user && user.id === street.creatorId
    if (!isOwner) {
      res.status(401).end()
      return
    }

    updateStreetWithUser(street, user)
      .then((street) => {
        res.status(204).end()
      })
      .catch(handleErrors)
  }
} // END function - export put
