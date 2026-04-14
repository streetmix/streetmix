import { Street } from '../../db/models/index.ts'
import { logger } from '../../lib/logger.ts'

import type { Request, Response } from 'express'

export async function get(req: Request, res: Response) {
  let results: Street[]

  try {
    results = await Street.findAll({
      where: { 'data.street.location': { $ne: null }, status: 'ACTIVE' },
    })
  } catch (err) {
    logger.error(err)
    res
      .status(500)
      .json({ status: 500, msg: 'Could not find streets with locations.' })
    return
  }

  const features = results.map((result) => {
    // Assuming this property must exist; the `.finaAll` query specifies it.
    const { latlng } = result.data.street.location!
    const coordinates = Array.isArray(latlng)
      ? [latlng[1], latlng[0]]
      : [latlng.lng, latlng.lat]

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates,
      },
      properties: result,
    }
  })

  const geojson = {
    type: 'FeatureCollection',
    features,
  }

  res.status(200).json(geojson)
}
