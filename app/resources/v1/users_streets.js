var mongoose = require('mongoose'),
    config = require('config'),
    async = require('async'),
    db = require('../../../lib/db.js'),
    User = require('../../models/user.js'),
    Street = require('../../models/street.js'),
    logger = require('../../../lib/logger.js')();

exports.get = function(req, res) {

  var handleFindUser = function(err, user) {

    if (err) {
      logger.error(err)
      res.status(500).send('Could not find user.')
      return
    }

    if (!user) {
      res.status(404).send('Could not find user.')
      return
    }

    var json = { streets: [] }

    var handleFindStreets = function(err, streets) {

      if (err) {
        logger.error(err)
        res.status(500).send('Could not find streets for user.')
        return
      }

      async.map(
        streets,
        function(street, callback) { street.asJson(callback) },
        function(err, results) {

          if (err) {
            logger.error(err)
            res.status(500).send('Could not append street.')
            return
          }

          json.streets = results
          res.status(200).send(json)

        }) // END - async.map

    } // END function - handleFindStreets

    Street.find({ creator_id: user._id, status: 'ACTIVE' })
      .sort({ updated_at: 'descending' })
      .exec(handleFindStreets)

  } // END function - handleFindUser

  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).send('Please provide user ID.')
    return
  }

  User.findOne({ id: req.params.user_id }, handleFindUser)

} // END function - exports.get
