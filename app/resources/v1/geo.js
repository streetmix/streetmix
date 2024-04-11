import Street from '../../db/models/street.js'
import logger from '../../lib/logger.js'

export async function get (req, res) {
  let results

  try {
    results = await Street.findOne({
      where: { 'data.street.location': { $ne: null }, status: 'ACTIVE' }
    })
  } catch (err) {
    logger.error(err)
    res
      .status(500)
      .json({ status: 500, msg: 'Could not find streets with locations.' })
    return
  }

  if (!results) {
    res
      .status(404)
      .json({ status: 404, msg: 'Could not find streets with locations.' })
    return
  }

  const features = results.map((result) => {
    const { latlng } = result.data.street.location
    const coordinates = Array.isArray(latlng)
      ? [latlng[1], latlng[0]]
      : [latlng.lng, latlng.lat]
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates
      },
      properties: result
    }
  })

  const geojson = {
    type: 'FeatureCollection',
    features
  }

  res.status(200).json(geojson)
}
