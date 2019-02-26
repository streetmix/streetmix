const cloudinary = require('cloudinary')
const config = require('config')
const User = require('../../app/models/user')
const Street = require('../../app/models/street')

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

    const streetName = street.name || 'Unnamed Street'
    const title = `${streetName} - Streetmix`

    res.locals.STREETMIX_TITLE = title

    return street
  }

  const handleFindStreet = async function (street) {
    const streetName = street.name || 'Unnamed Street'
    const title = `${streetName} - Streetmix`

    res.locals.STREETMIX_TITLE = title

    let streetThumbnail

    try {
      const response = await cloudinary.v2.api.resource(`${config.env}/street_thumbnails/${street.id}`)
      streetThumbnail = response && response.secure_url
    } catch (error) {
      console.log(error)
      throw new Error('Error finding street thumbnail from cloudinary.')
    }

    if (streetThumbnail) {
      res.locals.STREETMIX_IMAGE = streetThumbnail
    }

    next()
  }

  const handleError = function (error) {
    console.log(error)
    next()
  }

  findUserById(userId)
    .then(findStreetByNamespacedId)
    .then(handleFindStreet)
    .catch(handleError)
}
