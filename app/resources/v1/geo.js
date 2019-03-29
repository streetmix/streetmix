const Street = require('../../models/street.js')
const logger = require('../../../lib/logger.js')()

exports.get = async function (req, res) {
  let results

  try {
    results = await Street.find({ 'data.street.location': { $ne: null }, status: 'ACTIVE' })
  } catch (err) {
    logger.error(err)
    res.status(500).json({ status: 500, msg: 'Could not find streets with locations.' })
    return
  }

  if (!results) {
    res.status(404).json({ status: 404, msg: 'Could not find streets with locations.' })
    return
  }

  const features = results.map((result) => {
    const { latlng } = result.data.street.location
    const coordinates = (Array.isArray(latlng)) ? [latlng[1], latlng[0]] : [latlng.lng, latlng.lat]
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: coordinates
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
