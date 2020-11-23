/* eslint-env jest */
import { detectGeolocation, wasGeolocationAttempted } from '../geolocation'

// GeoIP service gets country code from Cloudflare headers
const geolocationResponse = {
  country_code: 'US'
}

// Mocks a successful response to geolocation.
const successResponse = jest.fn((url) =>
  Promise.resolve(
    new window.Response(JSON.stringify(geolocationResponse), {
      status: 200,
      headers: {
        'Content-type': 'application/json'
      }
    })
  )
)

// Mocks a failed response to geolocation.
const failResponse = jest.fn((url) =>
  Promise.resolve(
    new window.Response(undefined, {
      status: 404
    })
  )
)

describe('geolocation', () => {
  it('on request success, response contains country code', (done) => {
    window.fetch = successResponse

    return detectGeolocation().then((response) => {
      expect(response.country_code).toEqual(geolocationResponse.country_code)
      done()
    })
  })

  it('on request success, records geolocation service contact was attempted', (done) => {
    window.fetch = successResponse

    return detectGeolocation().then((response) => {
      const state = wasGeolocationAttempted()
      expect(state).toEqual(true)
      done()
    })
  })

  it('on request failure, records geolocation service contact was attempted', (done) => {
    window.fetch = failResponse

    return detectGeolocation().then(() => {
      const state = wasGeolocationAttempted()
      expect(state).toEqual(true)
      done()
    })
  })
})
