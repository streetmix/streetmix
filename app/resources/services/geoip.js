import appURL from '../../lib/url.js'

export function get (req, res) {
  // Prevent this service from being accessed by third parties
  if (
    req.headers.referer === undefined ||
    new URL(req.headers.referer).host !== appURL.host
  ) {
    res.status(403).json({
      status: 403,
      msg: "I'm sorry — you do not have access to this service."
    })

    return
  }

  const requestGeolocation = function () {
    // Check Cloudflare headers for country code
    // If we don't see the cf-ipcountry header, then we're not on Cloudflare.
    // If we don't know the geolocation, the request is still successfully
    // processed but returns a null value.
    let countryCode = null
    if (typeof req.headers['cf-ipcountry'] !== 'undefined') {
      countryCode = req.headers['cf-ipcountry']
    }

    res.set('CF-IPCountry', countryCode)
    res.status(200).json({
      country_code: countryCode
    })
  }
  requestGeolocation()
}
