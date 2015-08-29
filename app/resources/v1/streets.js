var async = require('async')
var config = require('config')
var uuid = require('uuid')

require('../../../lib/db.js')
var Street = require('../../models/street.js')
var User = require('../../models/user.js')
var Sequence = require('../../models/sequence.js')
var logger = require('../../../lib/logger.js')()

exports.post = function (req, res) {
  var street = new Street()
  var body

  street.id = uuid.v1()

  var request_ip = function (req) {
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
    street.creator_ip = request_ip(req)
  }

  var handleCreateStreet = function (err, s) {
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

  var handleNewStreetNamespacedId = function (err, namespacedId) {
    if (err) {
      logger.error(err)
      res.status(500).send('Could not create new street ID.')
      return
    }

    street.namespaced_id = namespacedId
    street.save(handleCreateStreet)

  } // END function - handleNewStreetNamespacedId

  var makeNamespacedId = function () {
    if (street.creator_id) {
      User.findByIdAndUpdate(street.creator_id,
        { $inc: { 'last_street_id': 1 } },
        null,
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

  var handleFindStreet = function (err, origStreet) {
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

  var saveStreet = function () {
    if (body && body.originalStreetId) {
      Street.findOne({ id: body.originalStreetId }, handleFindStreet)
    } else {
      makeNamespacedId()
    }

  } // END function - saveStreet

  var handleFindUser = function (err, user) {
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
  var handleDeleteStreet = function (err, s) {
    if (err) {
      logger.error(err)
      res.status(500).send('Could not delete street.')
      return
    }

    res.status(204).end()

  } // END function - handleDeleteStreet

  var handleFindStreet = function (err, street) {
    if (err) {
      logger.error(err)
      res.status(500).send('Could not find street.')
      return
    }

    if (!street) {
      res.status(204).end()
      return
    }

    var handleFindUser = function (err, user) {
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
  var handleFindStreet = function (err, street) {
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
  var creatorId = req.query.creatorId
  var namespacedId = req.query.namespacedId
  var start = (req.query.start && parseInt(req.query.start, 10) || 0)
  var count = (req.query.count && parseInt(req.query.count, 10) || 20)

  var handleFindStreet = function (err, street) {
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

    res.set('Location', config.restapi.baseuri + '/v1/streets/' + street.id)
    res.set('Content-Length', 0)
    res.status(307).end()
  } // END function - handleFindStreet

  var handleFindUser = function (err, user) {
    if (err || !user) {
      res.status(404).send('Creator not found.')
      return
    }

    Street.findOne({ namespaced_id: namespacedId, creator_id: user._id }, handleFindStreet)

  } // END function - handleFindUser

  var handleFindStreets = function (err, results) {
    if (err) {
      logger.error(err)
      res.status(500).send('Could not find streets.')
      return
    }

    var totalNumStreets = results[0]
    var streets = results[1]

    var selfUri = config.restapi.baseuri + '/v1/streets?start=' + start + '&count=' + count

    var json = {
      meta: {
        links: {
          self: selfUri
        }
      },
      streets: []
    }

    if (start > 0) {
      var prevStart, prevCount
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
      var nextStart, nextCount
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
  var body

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

  var handleUpdateStreet = function (err, street) {
    if (err) {
      logger.error(err)
      res.status(500).send('Could not update street.')
      return
    }

    res.status(204).end()

  } // END function - handleUpdateStreet

  var handleFindStreet = function (err, street) {
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

    var handleFindOriginalStreet = function (err, origStreet) {
      if (err || !origStreet) {
        res.status(404).send('Original street not found.')
        return
      }

      street.original_street_id = origStreet
      street.save(handleUpdateStreet)

    } // END function - handleFindOriginalStreet

    var updateStreetData = function () {
      street.name = body.name || street.name
      street.data = body.data || street.data

      if (body.originalStreetId) {
        Street.findOne({ id: body.originalStreetId }, handleFindOriginalStreet)
      } else {
        street.save(handleUpdateStreet)
      }

    } // END function - updateStreetData

    var handleFindUser = function (err, user) {
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
