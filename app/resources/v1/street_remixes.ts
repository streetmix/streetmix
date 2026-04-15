import { Street } from '../../db/models/index.ts'
import { logger } from '../../lib/logger.ts'
import { streetsToCSV } from '../../lib/streets_export.js'
import { ERRORS } from '../../lib/util.js'

import type { Request, Response } from 'express'

export async function get(req: Request, res: Response) {
  // Flag error if user ID is not provided
  if (!req.params.street_id) {
    res.status(400).json({ status: 400, msg: 'Please provide a street id.' })
    return
  }

  const findRemixedStreets = async function (streetId: string) {
    let streets: Street[]

    try {
      streets = await Street.findAll({
        where: { originalStreetId: streetId, status: 'ACTIVE' },
        order: [['updatedAt', 'DESC']],
      })
    } catch (err) {
      logger.error(err)
      // This error is thrown from here because calling `handleErrors`
      // directly and then returning will cause this function to return
      // `undefined` -- which is a type error further downstream.
      // We don't usually throw the ERRORS values directly though
      throw new Error(ERRORS.CANNOT_GET_STREET, { cause: err })
    }

    return streets
  } // END function - handleFindUserstreets

  const handleFindRemixedStreets = function (streets: Street[]) {
    const json = { streets }
    const csv = streetsToCSV(json)
    // For now, this sends CSV directly for export.
    // In future we might want to send JSON also for a UI.
    res.set('Content-Type', 'text/csv')
    res.status(200).send(csv).end()
  } // END function - handleFindUserStreets

  function handleErrors(error: string) {
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
          msg: 'Signed-in user cannot delete this street.',
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
  // TODO: Confirm that no remixed streets is an empty array

  try {
    const streets = await findRemixedStreets(req.params.street_id)
    handleFindRemixedStreets(streets)
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message)
      handleErrors(err.message)
    } else {
      console.error(err)
      handleErrors(String(err))
    }
  }
}
