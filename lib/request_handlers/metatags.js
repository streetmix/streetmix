const request = require('request')
const config = require('config')
const User = require('../../app/models/user')
const Street = require('../../app/models/street')
const logger = require('../../lib/logger')()

const ANON_CREATOR = '-'

module.exports = async function (req, res, next) {
  const userId = req.params.user_id
  const namespacedId = req.params.namespaced_id

  if (!userId || !namespacedId) {
    next()
  }

  // 1a) Find street using user._id and namespacedId.
  // 1b) Find street using namespacedId (if anon creator).
  // 2) Find street thumbnail using street.id
  // 3) Set res.locals.STREETMIX_TITLE if street found
  // 4) Set res.locals.STREETMIX_IMAGE if thumbnail found

  const findStreetWithCreatorId = async function (userId) {
    let user

    try {
      user = await User.findOne({ id: userId })
    } catch (error) {
      throw new Error('Error finding user.')
    }

    if (!user) {
      throw new Error('User not found.')
    }

    return Street.findOne({ creator_id: user._id, namespaced_id: namespacedId })
  }

  const findStreetWithNamespacedId = async function (namespacedId) {
    return Street.findOne({ creator_id: null, namespaced_id: namespacedId })
  }

  const handleFindStreetThumbnail = function (error, response, body) {
    if (error) {
      logger.error(error)
    } else {
      try {
        const results = JSON.parse(body)
        if (results && results.secure_url) {
          res.locals.STREETMIX_IMAGE = {
            image: results.secure_url,
            width: results.width,
            height: results.height
          }
        }
      } catch (error) {
        logger.error(error)
      }
    }

    next()
  }

  const handleFindStreet = async function (street) {
    if (!street) {
      throw new Error('Street not found.')
    }

    const streetName = street.name || 'Unnamed Street'
    const title = `${streetName} - Streetmix`

    res.locals.STREETMIX_TITLE = title
    res.locals.STREETMIX_URL += `${userId}/${namespacedId}/`

    let endpoint = config.restapi.protocol + config.app_host_port + config.restapi.baseuri + '/v1/streets/images/'

    // If street is a DEFAULT_STREET or EMPTY_STREET, the public id for the street thumbnail is the street type, not the street id.
    const streetData = street.data && street.data.street
    if (streetData && streetData.editCount === 0) {
      const streetType = (streetData.segments.length) ? 'DEFAULT_STREET' : 'EMPTY_STREET'
      endpoint += streetType
    } else {
      endpoint += street.id
    }

    request.get(endpoint, handleFindStreetThumbnail)
  }

  const handleError = function (error) {
    logger.error(error)
    next()
  }

  if (userId === ANON_CREATOR) {
    findStreetWithNamespacedId(namespacedId)
      .then(handleFindStreet)
      .catch(handleError)
  } else {
    findStreetWithCreatorId(userId)
      .then(handleFindStreet)
      .catch(handleError)
  }
}
