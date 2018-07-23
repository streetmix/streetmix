const async = require('async')

require('../../../lib/db.js')
const User = require('../../models/user.js')
const Street = require('../../models/street.js')
const logger = require('../../../lib/logger.js')()

// exports.get = function (req, res) {
//   const handleFindUser = function (err, user) {
//     if (err) {
//       logger.error(err)
//       res.status(500).send('Could not find user.')
//       return
//     }

//     if (!user) {
//       res.status(404).send('Could not find user.')
//       return
//     }

//     let json = { streets: [] }

//     const handleFindStreets = function (err, streets) {
//       if (err) {
//         logger.error(err)
//         res.status(500).send('Could not find streets for user.')
//         return
//       }

//       async.map(
//         streets,
//         function (street, callback) { street.asJson(callback) },
//         function (err, results) {
//           if (err) {
//             logger.error(err)
//             res.status(500).send('Could not append street.')
//             return
//           }

//           json.streets = results
//           res.status(200).send(json)
//         }) // END - async.map
//     } // END function - handleFindStreets

//     Street.find({ creator_id: user._id, status: 'ACTIVE' })
//       .sort({ updated_at: 'descending' })
//       .exec(handleFindStreets)
//   } // END function - handleFindUser

//   // Flag error if user ID is not provided
//   if (!req.params.user_id) {
//     res.status(400).send('Please provide user ID.')
//     return
//   }

//   User.findOne({ id: req.params.user_id }, handleFindUser)
// } // END function - exports.get

exports.get = async function (req, res) {
  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).send('Please provide user ID.')
  }

  const findUserStreets = async function (userId) {
    try {
      const streets = await Street.find({ creator_id: userId, status: 'ACTIVE' })
        .sort({ updated_at: 'descending' })
        .exec()

      if (!streets) {
        res.status(404).send('No streets were found')
      }
      return streets
    } catch (err) {
      logger.error(err)
      res.status(500).send('Could not find streets for user.')
    }
  } // END function - handleFindUserstreets

  const handleFindUserStreets = function (streets) {
    const json = { streets: [] }
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
  } // END function - handleFindUserStreets

  const handleFindUserStreetsError = function (err) {
    logger.error(err)
    res.status(500).send('Could not find user streets')
  }// END function - handleFindUserStreetsError

  try {
    const user = await User.findOne({ id: req.params.user_id })
    if (!user) {
      res.status(404).send('Could not find user.')
      return
    }
    findUserStreets(user._id)
      .then(handleFindUserStreets)
      .catch(handleFindUserStreetsError)
  } catch (err) {
    logger.error(err)
    res.status(500).send('Could not find user.')
  }
}
