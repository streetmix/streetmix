require('../../../lib/db.js')
const Street = require('../../models/street.js')
const logger = require('../../../lib/logger.js')()

exports.get = function (req, res) {
  const handleFindStreets = function (err, results) {
    if (err) {
      logger.error(err)
      res.status(500).send('Could not find streets with locations.')
      return
    }

    if (!results) {
      res.status(404).send('Could not find streets with locations.')
      return
    }

    const geojson = {
      type: 'FeatureCollection',
      features: []
    }

    for (let i = 0; i < results.length; i++) {
      results[i].asJson(function (err, streetJson) {
        if (err) {
          logger.error(err)
          res.status(500).send('Could not render street JSON.')
          return
        }
        const { location } = streetJson.data.street
        const feature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [location.latlng[1], location.latlng[0]]
          },
          properties: results[i]
        }
        geojson.features.push(feature)
      })
    }
    res.status(200).send(geojson)
  }

  Street.find({ 'data.street.location': { $ne: null }, status: 'ACTIVE' }, handleFindStreets)
}
