const async = require('async')
const config = require('config')
const uuid = require('uuid')

const Street = require('../../models/street.js')
const User = require('../../models/user.js')
const Sequence = require('../../models/sequence.js')
const logger = require('../../../lib/logger.js')()
const util = require('../../../lib/util.js')

exports.post = function (req, res) {
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
    street.creator_ip = util.requestIp(req)
  }

  const handleCreateStreet = function (err, s) {
    if (err) {
      logger.error(err)
      res.status(500).send('Could not create street.')
      return
    }

    s.asJson(function (err, streetJson) {
      if (err) {
        logger.error(err)
        res.status(500).send('Could not render street JSON.')
        return
      }

      logger.info({ street: streetJson }, 'New street created.')
      res.header('Location', config.restapi.baseuri + '/v1/streets/' + s.id)
      res.status(201).send(streetJson)
    })
  } // END function - handleCreateStreet

  const handleNewStreetNamespacedId = function (err, namespacedId) {
    if (err || !namespacedId) {
      logger.error(err)
      res.status(500).send('Could not create new street ID.')
      return
    }

    street.namespaced_id = namespacedId
    street.save(handleCreateStreet)
  } // END function - handleNewStreetNamespacedId

  const makeNamespacedId = function () {
    if (street.creator_id) {
      User.findByIdAndUpdate(street.creator_id,
        { $inc: { 'last_street_id': 1 } },
        { new: true, upsert: true },
        function (err, row) {
          handleNewStreetNamespacedId(err, (row ? row.last_street_id : null))
        })
    } else {
      Sequence.findByIdAndUpdate('streets',
        { $inc: { 'seq': 1 } },
        { new: true, upsert: true },
        function (err, row) {
          handleNewStreetNamespacedId(err, (row ? row.seq : null))
        })
    }
  } // END function - makeNamespacedId

  const handleFindStreet = function (err, origStreet) {
    if (err || !origStreet) {
      res.status(404).send('Original street not found.')
      return
    }

    if (origStreet.status === 'DELETED') {
      res.status(410).send('Original street not found.')
      return
    }

    street.original_street_id = origStreet
    makeNamespacedId()
  } // END function - handleFindStreet

  const saveStreet = function () {
    if (body && body.originalStreetId) {
      Street.findOne({ id: body.originalStreetId }, handleFindStreet)
    } else {
      makeNamespacedId()
    }
  } // END function - saveStreet

  const handleFindUser = function (err, user) {
    if (err || !user) {
      res.status(401).send('User with that login token not found.')
      return
    }

    street.creator_id = user
    saveStreet()
  } // END function - handleFindUser

  if (req.loginToken) {
    User.findOne({ login_tokens: { $in: [ req.loginToken ] } }, handleFindUser)
  } else {
    saveStreet()
  }
} // END function - exports.post

exports.delete = function (req, res) {
  const handleDeleteStreet = function (err, s) {
    if (err) {
      logger.error(err)
      res.status(500).send('Could not delete street.')
      return
    }

    res.status(204).end()
  } // END function - handleDeleteStreet

  const handleFindStreet = function (err, street) {
    if (err) {
      logger.error(err)
      res.status(500).send('Could not find street.')
      return
    }

    if (!street) {
      res.status(204).end()
      return
    }

    const handleFindUser = function (err, user) {
      if (err) {
        logger.error(err)
        res.status(500).send('Could not find signed-in user.')
        return
      }

      if (!user) {
        res.status(401).send('User is not signed-in.')
        return
      }

      if (!street.creator_id) {
        res.status(403).send('Signed-in user cannot delete this street.')
        return
      }

      if (street.creator_id.toString() !== user._id.toString()) {
        res.status(403).send('Signed-in user cannot delete this street.')
        return
      }

      street.status = 'DELETED'
      street.save(handleDeleteStreet)
    } // END function - handleFindUser

    User.findOne({ login_tokens: { $in: [ req.loginToken ] } }, handleFindUser)
  } // END function - handleFindStreet

  if (!req.loginToken) {
    res.status(401).end()
    return
  }

  if (!req.params.street_id) {
    res.status(400).send('Please provide street ID.')
    return
  }

  Street.findOne({ id: req.params.street_id }, handleFindStreet)
} // END function - exports.delete

exports.get = function (req, res) {
  const handleFindStreet = function (err, street) {
    if (err) {
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
  } // END function - handleFindStreet

  if (!req.params.street_id) {
    res.status(400).send('Please provide street ID.')
    return
  }

  Street.findOne({ id: req.params.street_id }, handleFindStreet)
} // END function - exports.get

exports.find = function (req, res) {
  const creatorId = req.query.creatorId
  const namespacedId = req.query.namespacedId
  const start = (req.query.start && parseInt(req.query.start, 10)) || 0
  const count = (req.query.count && parseInt(req.query.count, 10)) || 20

  const handleFindStreet = function (err, street) {
    if (err) {
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

    res.set('Access-Control-Allow-Origin', '*')
    res.set('Location', config.restapi.baseuri + '/v1/streets/' + street.id)
    res.set('Content-Length', 0)
    res.status(307).end()
  } // END function - handleFindStreet

  const handleFindUser = function (err, user) {
    if (err || !user) {
      res.status(404).send('Creator not found.')
      return
    }

    Street.findOne({ namespaced_id: namespacedId, creator_id: user._id }, handleFindStreet)
  } // END function - handleFindUser

  const handleFindStreets = function (err, results) {
    if (err) {
      logger.error(err)
      res.status(500).send('Could not find streets.')
      return
    }

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

  if (creatorId) {
    User.findOne({ id: creatorId }, handleFindUser)
  } else if (namespacedId) {
    Street.findOne({ namespaced_id: namespacedId, creator_id: null }, handleFindStreet)
  } else {
    async.parallel([
      function (callback) { Street.count({ status: 'ACTIVE' }, callback) },
      function (callback) {
        Street.find({ status: 'ACTIVE' })
          .sort({ updated_at: 'descending' })
          .skip(start)
          .limit(count)
          .exec(callback)
      }
    ], handleFindStreets)
  }
} // END function - exports.find

exports.put = function (req, res) {
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

  const handleUpdateStreet = function (err, street) {
    if (err) {
      logger.error(err)
      res.status(500).send('Could not update street.')
      return
    }

    res.status(204).end()
  } // END function - handleUpdateStreet

  const handleFindStreet = function (err, street) {
    if (err) {
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

    const handleFindOriginalStreet = function (err, origStreet) {
      if (err || !origStreet) {
        res.status(404).send('Original street not found.')
        return
      }

      street.original_street_id = origStreet
      street.save(handleUpdateStreet)
    } // END function - handleFindOriginalStreet

    const updateStreetData = function () {
      street.name = body.name || street.name
      street.data = body.data || street.data

      if (body.originalStreetId) {
        Street.findOne({ id: body.originalStreetId }, handleFindOriginalStreet)
      } else {
        street.save(handleUpdateStreet)
      }
    } // END function - updateStreetData

    const handleFindUser = function (err, user) {
      if (err) {
        logger.error(err)
        res.status(500).send('Could not find signed-in user.')
        return
      }

      if (!user) {
        res.status(401).send('User is not signed-in.')
        return
      }

      if (!street.creator_id) {
        res.status(403).send('Signed-in user cannot update this street.')
        return
      }

      if (street.creator_id.toString() !== user._id.toString()) {
        res.status(403).send('Signed-in user cannot update this street.')
        return
      }

      updateStreetData()
    } // END function - handleFindUser

    if (!street.creator_id) {
      updateStreetData()
    } else {
      if (!req.loginToken) {
        res.status(401).end()
        return
      }

      User.findOne({ login_tokens: { $in: [ req.loginToken ] } }, handleFindUser)
    } // END else - street has a creator
  } // END function - handleFindStreet

  if (!req.params.street_id) {
    res.status(400).send('Please provide street ID.')
    return
  }

  Street.findOne({ id: req.params.street_id }, handleFindStreet)
} // END function - exports.put
