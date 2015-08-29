var async = require('async')

require('../../lib/db.js')
var Street = require('../models/street.js')

exports.get = function (req, res) {
  var response = {
    status: null,
    updated: null,
    dependencies: [],
    resources: {}
  }

  response.dependencies = [ 'facebook', 'twitter', 'sendgrid', 'mongohq', 'papertrail' ]
  response.updated = Math.floor(new Date().getTime() / 1000)

  async.parallel([
    fetchStreetFromDb
  ], function (err, results) {
      if (err) {
        response.status = err
      } else {
        response.status = 'ok'
      }
      res.send(200, response)
    })
}

var fetchStreetFromDb = function (cb) {
  Street.count({}, function (err, count) {
    if (err) {
      cb(err)
    } else if (count === 0) {
      cb('0 streets returned.')
    } else {
      cb()
    }
  })
}

// TODO: Resources: % db used, % sendgrid used (0 - 100)
// TODO: Add sendgrid check - status

// #
// # Try to ask Sendgrid how many emails we have sent in the past month.
// #
// try:
//     url = 'https://sendgrid.com/api/stats.get.json?api_user=%(MAIL_USERNAME)s&api_key=%(MAIL_PASSWORD)s&days=30' % app.config
//     got = get(url)

//     if got.status_code != 200:
//         raise Exception('HTTP status %s from Sendgrid /api/stats.get' % got.status_code)

//     mails = sum([m['delivered'] + m['repeat_bounces'] for m in got.json()])
//     response['resources']['Sendgrid'] = 100 * float(mails) / int(app.config.get('SENDGRID_MONTHLY_LIMIT') or 40000)
