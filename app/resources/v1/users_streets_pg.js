const { User, Street } = require('../../db/models')
const { ERRORS } = require('../../../lib/util')
const logger = require('../../../lib/logger.js')()

exports.get = async function (req, res) {
  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).send('Please provide user ID.')
  }

  const findUserStreets = async function (userId) {
    let streets
    try {
      streets = await Street.findAll({
        include: [{
          model: User,
          where: { creator_id: userId }
        }],
        order: [ ['updated_at', 'DESC'] ]
      })
    } catch (err) {
      logger.error(err)
      handleErrors(ERRORS.CANNOT_GET_STREET)
    }

    if (!streets) {
      throw new Error(ERRORS.STREET_NOT_FOUND)
    }
    return streets
  } // END function - handleFindUserstreets

  const handleFindUserStreets = function (streets) {
    const json = { streets: streets }
    res.status(200).send(json)
  } // END function - handleFindUserStreets

  function handleErrors (error) {
    switch (error) {
      case ERRORS.USER_NOT_FOUND:
        res.status(404).send('Creator not found.')
        return
      case ERRORS.STREET_NOT_FOUND:
        res.status(404).send('Could not find streets.')
        return
      case ERRORS.STREET_DELETED:
        res.status(410).send('Could not find street.')
        return
      case ERRORS.CANNOT_GET_STREET:
        res.status(500).send('Could not find streets for user.')
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

  let user
  try {
    user = await User.findByPk(req.params.user_id)
  } catch (err) {
    logger.error(err)
    handleErrors(ERRORS.CANNOT_GET_STREET)
  }

  if (!user) {
    res.status(404).send('Could not find user.')
    return
  }

  findUserStreets(user._id)
    .then(handleFindUserStreets)
    .catch(handleErrors)
}
