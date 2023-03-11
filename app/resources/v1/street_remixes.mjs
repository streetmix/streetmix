import models from '../../db/models/index.js'
import logger from '../../lib/logger.js'
import { streetsToCSV } from '../../lib/streets_export.js'
import { ERRORS } from '../../lib/util.js'

const { Street } = models

export async function get (req, res) {
  // Flag error if user ID is not provided
  if (!req.params.street_id) {
    res.status(400).json({ status: 400, msg: 'Please provide a street id.' })
    return
  }

  const findRemixedStreets = async function (streetId) {
    let streets
    try {
      streets = await Street.findAll({
        where: { originalStreetId: streetId, status: 'ACTIVE' },
        order: [['updatedAt', 'DESC']]
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

  const handleFindRemixedStreets = function (streets) {
    const json = { streets }
    const csv = streetsToCSV(json)
    // For now, this sends CSV directly for export.
    // In future we might want to send JSON also for a UI.
    res.set('Content-Type', 'text/csv')
    res.status(200).send(csv).end()
  } // END function - handleFindUserStreets

  function handleErrors (error) {
    switch (error) {
      case ERRORS.USER_NOT_FOUND:
        res.status(404).json({ status: 404, msg: 'Creator not found.' })
        return
      case ERRORS.STREET_NOT_FOUND:
        res.status(404).json({ status: 404, msg: 'Could not find streets.' })
        return
      case ERRORS.STREET_DELETED:
        res.status(410).json({ status: 410, msg: 'Could not find street.' })
        return
      case ERRORS.CANNOT_GET_STREET:
        res.status(500).json({ status: 500, msg: 'Could not find street.' })
        return
      case ERRORS.UNAUTHORISED_ACCESS:
        res.status(401).json({ status: 401, msg: 'User is not signed-in.' })
        return
      case ERRORS.FORBIDDEN_REQUEST:
        res.status(403).json({
          status: 403,
          msg: 'Signed-in user cannot delete this street.'
        })
        return
      default:
        res.status(500).end()
    }
  } // END function - handleErrors

  let street
  try {
    street = await Street.findOne({ where: { id: req.params.street_id } })
  } catch (err) {
    logger.error(err)
    handleErrors(ERRORS.CANNOT_GET_STREET)
    return
  }

  if (!street) {
    handleErrors(ERRORS.STREET_NOT_FOUND)
    return
  }

  // TODO: Check for author of street?
  // TODO: Recursively look for the remixes of remixes

  try {
    const streets = await findRemixedStreets(req.params.street_id)
    handleFindRemixedStreets(streets)
  } catch (err) {
    console.error(err)
    handleErrors(err)
  }
}
