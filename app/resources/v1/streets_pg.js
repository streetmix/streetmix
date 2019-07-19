const config = require('config')
const uuid = require('uuid')
const { isArray } = require('lodash')
const { ERRORS, asStreetJson } = require('../../../lib/util')
const logger = require('../../../lib/logger.js')()
const { User, Sequelize, Street, Sequence } = require('../../db/models')

const Op = Sequelize.Op

exports.post = async function (req, res) {
  let body
  const street = new Street()
  street.id = uuid.v1()
  const requestIp = function (req) {
    if (req.headers['x-forwarded-for'] !== undefined) {
      return req.headers['x-forwarded-for'].split(', ')[0]
    } else {
      return req.connection.remoteAddress
    }
  }

  if (req.body && (req.body.length > 0)) {
    try {
      body = req.body
    } catch (e) {
      res.status(400).send('Could not parse body as JSON.')
      return
    }
    // TODO: Validation
    street.name = body.name
    street.data = body.data
    street.creator_ip = requestIp(req)
  }

  function handleErrors (error) {
    switch (error) {
      case ERRORS.USER_NOT_FOUND:
        res.status(404).send('User not found.')
        return
      case ERRORS.STREET_NOT_FOUND:
        res.status(404).send('Original street not found.')
        return
      case ERRORS.CANNOT_CREATE_STREET:
        res.status(500).send('Could not create new street ID.')
        return
      case ERRORS.UNAUTHORISED_ACCESS:
        res.status(401).send('User with that login token not found.')
        return
      default:
        res.status(500).end()
    }
  }

  function updateUserLastStreetId (userId) {
    return User.findByPk(userId)
      .then(user => {
        return user.increment('last_street_id', { by: 1 })
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
      if (street.creator_id) {
        const user = await updateUserLastStreetId(street.creator_id)
        namespacedId = (user) ? user.last_street_id : null
      } else {
        const sequence = await updateSequence()
        if (isArray(sequence)) {
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
  } // END function - makeNamespacedId

  const saveStreet = async function () {
    if (body && body.originalStreetId) {
      let origStreet
      try {
        origStreet = await Street.findByPk(body.originalStreetId)
      } catch (err) {
        logger.error(err)
        throw new Error(ERRORS.STREET_NOT_FOUND)
      }

      if (!origStreet || origStreet.status === 'DELETED') {
        throw new Error(ERRORS.STREET_NOT_FOUND)
      }

      street.original_street_id = origStreet
      const namespacedId = await makeNamespacedId()
      street.namespaced_id = namespacedId
      return street.save({ returning: true })
    }

    const namespacedId = await makeNamespacedId()
    street.namespaced_id = namespacedId
    return street.save({ returning: true })
  }

  const handleCreatedStreet = (s) => {
    s = asStreetJson(s)
    logger.info({ street: s }, 'New street created.')
    res.header('Location', config.restapi.baseuri + '/v1/streets/' + s.id)
    res.status(201).send(s)
  }

  if (req.loginToken) {
    let user
    try {
      user = await User.findOne({
        where: { login_tokens: { [Op.contains]: [ req.loginToken ] } }
      })
    } catch (err) {
      logger.error(err)
      handleErrors(ERRORS.USER_NOT_FOUND)
    }

    if (!user) {
      handleErrors(ERRORS.UNAUTHORISED_ACCESS)
    }
    console.log('I came here')
    street.creator_id = user
    saveStreet()
      .then(handleCreatedStreet)
      .catch(handleErrors)
  } else {
    saveStreet()
      .then(handleCreatedStreet)
      .catch(handleErrors)
  }
}

exports.delete = async function (req, res) {
  if (!req.loginToken) {
    res.status(401).end()
    return
  }

  if (!req.params.street_id) {
    res.status(400).send('Please provide street ID.')
    return
  }

  async function deleteStreet (street) {
    let user
    try {
      user = await User.findOne({
        where: { login_tokens: { [Op.contains]: [ req.loginToken ] } }
      })
    } catch (err) {
      logger.error(err)
      throw new Error(ERRORS.USER_NOT_FOUND)
    }

    if (!user) {
      throw new Error(ERRORS.UNAUTHORISED_ACCESS)
    }

    if (!street.creator_id) {
      throw new Error(ERRORS.FORBIDDEN_REQUEST)
    }

    if (street.creator_id.toString() !== user._id.toString()) {
      throw new Error(ERRORS.FORBIDDEN_REQUEST)
    }

    street.status = 'DELETED'
    return Street.update(street, { where: { id: req.params.street_id }, returning: true })
  }

  function handleErrors (error) {
    switch (error) {
      case ERRORS.USER_NOT_FOUND:
        res.status(404).send('User not found.')
        return
      case ERRORS.STREET_NOT_FOUND:
        res.status(404).send('Could not find street.')
        return
      case ERRORS.UNAUTHORISED_ACCESS:
        res.status(401).send('User is not signed-in.')
        return
      case ERRORS.FORBIDDEN_REQUEST:
        res.status(403).send('Signed-in user cannot delete this street.')
        return
      default:
        res.status(500).end()
    }
  }

  let street

  try {
    street = await Street.findByPk(req.params.street_id)
  } catch (err) {
    logger.error(err)
    handleErrors(ERRORS.STREET_NOT_FOUND)
  }

  if (!street) {
    res.status(204).end()
    return
  }

  deleteStreet(street)
    .then(street => { res.status(204).end() })
    .catch(handleErrors)
} // END function - exports.delete

exports.get = async function (req, res) {
  if (!req.params.street_id) {
    res.status(400).send('Please provide street ID.')
    return
  }
  let street

  try {
    street = await Street.findOne({
      where: { id: req.params.street_id }
    })
  } catch (err) {
    logger.error(err)
    res.status(500).send('Could not find street.')
    return
  }

  if (!street) {
    res.status(404).send('Could not find street.')
    return
  }

  if (street.status === 'DELETED') {
    res.status(410).send('Could not find street.')
    return
  }

  res.header('Last-Modified', street.updated_at)
  if (req.method === 'HEAD') {
    res.status(204).end()
    return
  }
  street = asStreetJson(street)
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Location', config.restapi.baseuri + '/v1/streets/' + street.id)
  res.status(200).send(street)
} // END function - exports.get

exports.find = async function (req, res) {
  const creatorId = req.query.creatorId
  const namespacedId = req.query.namespacedId
  const start = (req.query.start && parseInt(req.query.start, 10)) || 0
  const count = (req.query.count && parseInt(req.query.count, 10)) || 20

  const findStreetWithCreatorId = async function (creatorId) {
    let user
    try {
      user = await User.findByPk(creatorId)
    } catch (err) {
      logger.error(err)
      handleErrors(ERRORS.USER_NOT_FOUND)
    }

    if (!user) {
      throw new Error(ERRORS.USER_NOT_FOUND)
    }
    return Street.findOne({
      where: { namespaced_id: namespacedId, creator_id: user._id }
    })
  } // END function - findStreetWithCreatorId

  const findStreetWithNamespacedId = async function (namespacedId) {
    return Street.findOne({
      where: { namespaced_id: namespacedId, creator_id: null }
    })
  }

  const findStreets = async function (start, count) {
    return Street.findAndCountAll({
      where: { status: 'ACTIVE' },
      order: [ ['updated_at', 'DESC'] ],
      offset: start,
      limit: count
    })
  } // END function - findStreets

  function handleErrors (error) {
    switch (error) {
      case ERRORS.USER_NOT_FOUND:
        res.status(404).send('Creator not found.')
        return
      case ERRORS.STREET_NOT_FOUND:
        res.status(404).send('Could not find street.')
        return
      case ERRORS.STREET_DELETED:
        res.status(410).send('Could not find street.')
        return
      case ERRORS.UNAUTHORISED_ACCESS:
        res.status(401).send('User is not signed-in.')
        return
      case ERRORS.FORBIDDEN_REQUEST:
        res.status(403).send('Signed-in user cannot delete this street.')
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
    res.set('Location', config.restapi.baseuri + '/v1/streets/' + street.id)
    res.set('Content-Length', 0)
    res.status(307).end()
  } // END function - handleFindStreet

  const handleFindStreets = function (results) {
    const totalNumStreets = results.count
    const streets = results.rows

    const selfUri = config.restapi.baseuri + '/v1/streets?start=' + start + '&count=' + count

    const json = {
      meta: {
        links: {
          self: selfUri
        }
      },
      streets: streets
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
      json.meta.links.prev = config.restapi.baseuri + '/v1/streets?start=' + prevStart + '&count=' + prevCount
    }

    if (start + streets.length < totalNumStreets) {
      let nextStart, nextCount
      nextStart = start + count
      nextCount = Math.min(count, totalNumStreets - start - streets.length)
      json.meta.links.next = config.restapi.baseuri + '/v1/streets?start=' + nextStart + '&count=' + nextCount
    }
    res.status(200).send(json)
  } // END function - handleFindStreets

  if (creatorId) {
    findStreetWithCreatorId(creatorId)
      .then(handleFindStreet)
      .catch(handleErrors)
  } else if (namespacedId) {
    findStreetWithNamespacedId(namespacedId)
      .then(handleFindStreet)
      .catch(handleErrors)
  } else {
    findStreets(start, count)
      .then(handleFindStreets)
      .catch(handleErrors)
  }
}

exports.put = async function (req, res) {
  let body

  if (req.body) {
    try {
      body = req.body
    } catch (e) {
      res.status(400).send('Could not parse body as JSON.')
      return
    }
  } else {
    res.status(400).send('Street information not specified.')
    return
  }

  if (!req.params.street_id) {
    res.status(400).send('Please provide street ID.')
    return
  }

  function handleErrors (error) {
    switch (error) {
      case ERRORS.USER_NOT_FOUND:
        res.status(404).send('Creator not found.')
        return
      case ERRORS.STREET_NOT_FOUND:
        res.status(404).send('Original street not found.')
        return
      case ERRORS.STREET_DELETED:
        res.status(410).send('Could not find street.')
        return
      case ERRORS.CANNOT_UPDATE_STREET:
        res.status(500).send('Could not update street.')
        return
      case ERRORS.UNAUTHORISED_ACCESS:
        res.status(401).send('User is not signed-in.')
        return
      case ERRORS.FORBIDDEN_REQUEST:
        res.status(403).send('Signed-in user cannot update this street.')
        return
      default:
        res.status(500).end()
    }
  } // END function - handleErrors

  async function updateStreetData (street) {
    street.name = body.name || street.name
    street.data = body.data || street.data
    if (body.originalStreetId) {
      let origStreet
      try {
        origStreet = await Street.findByPk(body.originalStreetId)
      } catch (err) {
        logger.error(err)
        handleErrors(ERRORS.CANNOT_UPDATE_STREET)
      }

      if (!origStreet) {
        throw new Error(ERRORS.STREET_NOT_FOUND)
      }

      street.original_street_id = origStreet.id
      console.log(JSON.stringify(street))
      return street.save({ returning: true })
    } else {
      return street.save({ returning: true })
    }
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

  async function updateStreetWithCreatorId (street) {
    let user
    try {
      user = await User.findOne({
        where: { login_tokens: { [Op.contains]: [ req.loginToken ] } }
      })
    } catch (err) {
      logger.error(err)
      handleErrors(ERRORS.CANNOT_UPDATE_STREET)
    }

    if (!user) {
      throw new Error(ERRORS.UNAUTHORISED_ACCESS)
    }

    if (!street.creator_id) {
      throw new Error(ERRORS.FORBIDDEN_REQUEST)
    }

    if (street.creator_id.toString() !== user.id.toString()) {
      throw new Error(ERRORS.FORBIDDEN_REQUEST)
    }
    return updateStreetData(street)
  } // END function - updateStreetWithCreatorId

  if (!street) {
    handleErrors(ERRORS.STREET_NOT_FOUND)
    return
  }

  if (street.status === 'DELETED') {
    handleErrors(ERRORS.STREET_DELETED)
    return
  }

  if (!street.creator_id) {
    updateStreetData(street)
      .then(street => {
        res.status(204).end()
      })
      .catch(handleErrors)
  } else {
    if (!req.loginToken) {
      res.status(401).end()
      return
    }
    updateStreetWithCreatorId(street)
      .then(street => { res.status(204).end() })
      .catch(handleErrors)
  }
} // END function - exports.put
