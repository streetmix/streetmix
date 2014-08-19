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
      res.send(500, 'Could not find user.')
      return
    }

    if (!user) {
      res.send(404, 'Could not find user.')
      return
    }
   
    var json = { streets: [] }

    var handleFindStreets = function(err, streets) {
      
      if (err) {
        logger.error(err)
        res.send(500, 'Could not find streets for user.')
        return
      }
      
      async.map(
        streets,
        function(street, callback) { street.asJson(callback) },
        function(err, results) {
          
          if (err) {
            logger.error(err)
            res.send(500, 'Could not append street.')
            return
          }

          json.streets = results
          res.send(200, json)
          
        }) // END - async.map

    } // END function - handleFindStreets
  
    Street.find({ creator_id: user._id, status: 'ACTIVE' })
      .sort({ updated_at: 'descending' })
      .exec(handleFindStreets)
    
  } // END function - handleFindUser

  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.send(400, 'Please provide user ID.')
    return
  }

  User.findOne({ id: req.params.user_id }, handleFindUser)

} // END function - exports.get
