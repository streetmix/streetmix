const async = require('async')
const config = require('config')
const uuid = require('uuid')

const Street = require('../../models/street.js')
const User = require('../../models/user.js')
const Sequence = require('../../models/sequence.js')
const logger = require('../../../lib/logger.js')()
const { ERRORS, requestIp } = require('../../../lib/util')

exports.post = async function (req, res) {
  const street = new Street()
  let body

  street.id = uuid.v1()

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

  const makeNamespacedId = async function () {
    let namespacedId
    try {
      if (street.creator_id) {
        const row = await User.findByIdAndUpdate(street.creator_id,
          { $inc: { 'last_street_id': 1 } },
          { new: true, upsert: true })
        namespacedId = (row) ? row.last_street_id : null
      } else {
        const row = await Sequence.findByIdAndUpdate('streets',
          { $inc: { 'seq': 1 } },
          { new: true, upsert: true })
        namespacedId = (row) ? row.seq : null
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
        origStreet = await Street.findOne({ id: body.originalStreetId })
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
      return street.save()
    }

    const namespacedId = await makeNamespacedId()
    street.namespaced_id = namespacedId
    return street.save()
  } // END function - saveStreet

  const handleCreatedStreet = (s) => {
    s.asJson((err, streetJson) => {
      if (err) {
        logger.error(err)
        res.status(500).send('Could not render street JSON.')
        return
      }
      logger.info({ street: streetJson }, 'New street created.')
      res.header('Location', config.restapi.baseuri + '/v1/streets/' + s.id)
      res.status(201).send(streetJson)
    })
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

  if (req.loginToken) {
    let user
    try {
      user = await User.findOne({ login_tokens: { $in: [ req.loginToken ] } })
    } catch (err) {
      logger.error(err)
      handleErrors(ERRORS.USER_NOT_FOUND)
    }

    if (!user) {
      handleErrors(ERRORS.UNAUTHORISED_ACCESS)
    }

    street.creator_id = user
    saveStreet()
      .then(handleCreatedStreet)
      .catch(handleErrors)
  } else {
    saveStreet()
      .then(handleCreatedStreet)
      .catch(handleErrors)
  }
} // END function - exports.post

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
      user = await User.findOne({ login_tokens: { $in: [ req.loginToken ] } })
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
    return street.save()
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
    street = await Street.findOne({ id: req.params.street_id })
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
    street = await Street.findOne({ id: req.params.street_id })
  } catch (err) {
    logger.error(err)
    res.status(500).send('Could not find street.')
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
  street.asJson(function (err, streetJson) {
    if (err) {
      logger.error(err)
      res.status(500).send('Could not render street JSON.')
      return
    }
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Location', config.restapi.baseuri + '/v1/streets/' + street.id)
    res.status(200).send(streetJson)
  })
} // END function - exports.get

exports.find = function (req, res) {
  const creatorId = req.query.creatorId
  const namespacedId = req.query.namespacedId
  const start = (req.query.start && parseInt(req.query.start, 10)) || 0
  const count = (req.query.count && parseInt(req.query.count, 10)) || 20

  const findStreetWithCreatorId = async function (creatorId) {
    let user
    try {
      user = await User.findOne({ id: creatorId })
    } catch (err) {
      logger.error(err)
      handleErrors(ERRORS.USER_NOT_FOUND)
    }

    if (!user) {
      throw new Error(ERRORS.USER_NOT_FOUND)
    }
    return Street.findOne({ namespaced_id: namespacedId, creator_id: user._id })
  } // END function - findStreetWithCreatorId

  const findStreetWithNamespacedId = async function (namespacedId) {
    return Street.findOne({ namespaced_id: namespacedId, creator_id: null })
  }

  const findStreets = async function (start, count) {
    return Promise.all([
      Street.count({ status: 'ACTIVE' }),
      Street.find({ status: 'ACTIVE' })
        .sort({ updated_at: 'descending' })
        .skip(start)
        .limit(count)
        .exec()
    ])
  } // END function - findStreets

  const handleFindStreet = function (street) {
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
    const totalNumStreets = results[0]
    const streets = results[1]

    const selfUri = config.restapi.baseuri + '/v1/streets?start=' + start + '&count=' + count

    const json = {
      meta: {
        links: {
          self: selfUri
        }
      },
      streets: []
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
  } // END function - handleFindStreets

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
} // END function - exports.find

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

  async function updateStreetData (street) {
    street.name = body.name || street.name
    street.data = body.data || street.data
    if (body.originalStreetId) {
      let origStreet
      try {
        origStreet = await Street.findOne({ id: body.originalStreetId })
      } catch (err) {
        logger.error(err)
        handleErrors(ERRORS.CANNOT_UPDATE_STREET)
      }

      if (!origStreet) {
        throw new Error(ERRORS.STREET_NOT_FOUND)
      }

      street.original_street_id = origStreet
      return street.save()
    } else {
      return street.save()
    }
  } // END function - updateStreetData

  async function updateStreetWithCreatorId (street) {
    let user
    try {
      user = await User.findOne({ login_tokens: { $in: [ req.loginToken ] } })
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

    if (street.creator_id.toString() !== user._id.toString()) {
      throw new Error(ERRORS.FORBIDDEN_REQUEST)
    }
    return updateStreetData(street)
  } // END function - updateStreetWithCreatorId

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

  let street
  try {
    street = await Street.findOne({ id: req.params.street_id })
  } catch (err) {
    logger.error(err)
    handleErrors(ERRORS.CANNOT_UPDATE_STREET)
  }

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
      .then(street => { res.status(204).end() })
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
