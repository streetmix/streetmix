const request = require('request')
const config = require('config')
const User = require('../../app/models/user')
const Street = require('../../app/models/street')
const logger = require('../../lib/logger')()

module.exports = async function (req, res, next) {
  const userId = req.params.user_id
  const namespacedId = req.params.namespaced_id

  if (!userId || !namespacedId) {
    next()
  }

  // 1) Find user using userId.
  // 2) Find street using user._id and namespacedId.
  // 3) Find street thumbnail using street.id
  // 4a) Set res.locals.STREETMIX_TITLE if street found
  // 4b) Set res.locals.STREETMIX_IMAGE if thumbnail found

  const findUserById = async function (userId) {
    let user

    try {
      user = await User.findOne({ id: userId })
    } catch (error) {
      throw new Error('Error finding user.')
    }

    if (!user) {
      throw new Error('User not found.')
    }

    return user
  }

  const findStreetByNamespacedId = async function (user) {
    let street

    try {
      const creatorId = user._id.toString()
      street = await Street.findOne({ creator_id: creatorId, namespaced_id: namespacedId })
    } catch (error) {
      throw new Error('Error finding street.')
    }

    if (!street) {
      throw new Error('Street not found.')
    }

    return street
  }

  const handleFindStreetThumbnail = function (error, response, body) {
    if (error) {
      logger.error(error)
    } else {
      try {
        const results = JSON.parse(body)
        if (results && results.image) {
          res.locals.STREETMIX_IMAGE = results.image
        }
      } catch (error) {
        logger.error(error)
      }
    }

    next()
  }

  const handleFindStreet = async function (street) {
    const streetName = street.name || 'Unnamed Street'
    const title = `${streetName} - Streetmix`

    res.locals.STREETMIX_TITLE = title
    res.locals.STREETMIX_URL += `${userId}/${namespacedId}/`

    const endpoint = config.restapi.protocol + config.app_host_port + config.restapi.baseuri + `/v1/streets/images/${street.id}`
    request.get(endpoint, handleFindStreetThumbnail)
  }

  const handleError = function (error) {
    logger.error(error)
    next()
  }

  findUserById(userId)
    .then(findStreetByNamespacedId)
    .then(handleFindStreet)
    .catch(handleError)
}
