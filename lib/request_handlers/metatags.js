const cloudinary = require('cloudinary')
const config = require('config')
const User = require('../../app/models/user')
const Street = require('../../app/models/street')

module.exports = async function (req, res) {
  // Default local variables set initially.
  const DEFAULT_LOCALS = {
    STREETMIX_TITLE: 'Streetmix',
    STREETMIX_IMAGE: 'https://streetmix.net/images/thumbnail.png'
  }

  // Attempt retrieving street thumbnail if url is in shape of `/:user_id/:namespaced_id`
  const params = req.path && req.path.split('/').slice(1)
  const userId = params && params[0]
  const namespacedId = params && params[1]

  if (!userId || !namespacedId) {
    res.render('main', DEFAULT_LOCALS)
    return
  }

  // 1) Find user using userId.
  // 2) Find street using user._id and namespacedId.
  // 3) Find street thumbnail using street.id

  const findUserById = async function (userId) {
    let user

    try {
      user = await User.findOne({ id: userId })
    } catch (error) {
      throw new Error(error)
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
      throw new Error(error)
    }

    if (!street) {
      throw new Error('Street not found.')
    }

    return street
  }

  const findStreetThumbnail = async function (streetId) {
    let streetThumbnail

    try {
      const response = await cloudinary.v2.api.resource(`${config.env}/street_thumbnails/${streetId}`)
      streetThumbnail = response && response.secure_url
    } catch (error) {
      throw new Error(error.message)
    }

    if (!streetThumbnail) {
      throw new Error('Street thumbnail not found.')
    }

    return streetThumbnail
  }

  const handleError = function (error) {
    console.log('Metatag error:' + error.message)
    res.render('main', DEFAULT_LOCALS)
  }

  const handleFindStreet = async function (street) {
    const streetName = street.name || 'Unnamed Street'
    const title = `${streetName} - Streetmix`

    let thumbnail

    try {
      thumbnail = await findStreetThumbnail(street.id)
    } catch (error) {
      console.log(error, error.message)
      thumbnail = DEFAULT_LOCALS.STREETMIX_IMAGE
    }

    res.render('main', { STREETMIX_TITLE: title, STREETMIX_IMAGE: thumbnail })
  }

  findUserById(userId)
    .then(findStreetByNamespacedId)
    .then(handleFindStreet)
    .catch(handleError)
}
