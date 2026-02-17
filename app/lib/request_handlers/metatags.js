import request from 'request'

import models from '../../db/models/index.js'
import { logger } from '../logger.ts'
import { appURL } from '../url.ts'

const ANON_CREATOR = '-'
const { User, Street } = models

export default async function (req, res, next) {
  const userId = req.params.user_id
  const namespacedId = req.params.namespacedId

  if (!userId || !namespacedId) {
    next()
  }

  // 1a) Find street using user.id and namespacedId.
  // 1b) Find street using namespacedId (if anon creator).
  // 2) Find street thumbnail using street.id
  // 3) Set res.locals.STREETMIX_TITLE if street found
  // 4) Set res.locals.STREETMIX_IMAGE if thumbnail found

  const findStreetWithCreatorId = async function (userId) {
    let user

    try {
      user = await User.findOne({ where: { id: userId } })
    } catch (error) {
      throw new Error('Error finding user.')
    }

    if (!user) {
      throw new Error('User not found.')
    }

    return Street.findOne({
      where: { creator_id: user.id, namespacedId },
    })
  }

  const findStreetWithNamespacedId = async function (namespacedId) {
    return Street.findOne({
      where: { creator_id: null, namespacedId },
    })
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
            height: results.height,
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

    // If street is a DEFAULT_STREET or EMPTY_STREET, the public id for the street thumbnail is the street type, not the street id.
    const streetData = street.data && street.data.street
    let streetId
    if (streetData && streetData.editCount === 0) {
      streetId = streetData.segments.length ? 'DEFAULT_STREET' : 'EMPTY_STREET'
    } else {
      streetId = street.id
    }

    const endpoint = `${appURL.origin}/api/v1/streets/${streetId}/image/`

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
    findStreetWithCreatorId(userId).then(handleFindStreet).catch(handleError)
  }
}
