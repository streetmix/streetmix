/* eslint-env jest */
import { detectGeolocation, wasGeolocationAttempted } from '../geolocation'

// A typical response from https://freegeoip.net/json/
const geolocationResponse = {
  ip: '50.202.200.121',
  country_code: 'US',
  country_name: 'United States',
  region_code: 'MA',
  region_name: 'Massachusetts',
  city: 'Malden',
  zip_code: '02148',
  time_zone: 'America/New_York',
  latitude: 42.4251,
  longitude: -71.0662,
  metro_code: 506
}

// Mocks a successful response to geolocation.
const successResponse = jest.fn(url =>
  Promise.resolve(new window.Response(JSON.stringify(geolocationResponse), {
    status: 200,
    headers: {
      'Content-type': 'application/json'
    }
  }))
)

// Mocks a failed response to geolocation.
const failResponse = jest.fn(url =>
  Promise.resolve(new window.Response(undefined, {
    status: 404
  }))
)

// Mocks a response that never resolves
const timeoutResponse = jest.fn(url => Promise.race([]))

describe('geolocation', () => {
  it('on request success, response contains lat/lng properties', (done) => {
    window.fetch = successResponse

    return detectGeolocation()
      .then(response => {
        expect(response.latitude).toEqual(geolocationResponse.latitude)
        expect(response.longitude).toEqual(geolocationResponse.longitude)
        done()
      })
  })

  it('on request success, records geolocation service contact was attempted', (done) => {
    window.fetch = successResponse

    return detectGeolocation()
      .then(response => {
        const state = wasGeolocationAttempted()
        expect(state).toEqual(true)
        done()
      })
  })

  it('on request failure, records geolocation service contact was attempted', (done) => {
    window.fetch = failResponse

    return detectGeolocation()
      .then(() => {
        const state = wasGeolocationAttempted()
        expect(state).toEqual(true)
        done()
      })
  })

  it('on request timeout, returns timeout object', (done) => {
    window.fetch = timeoutResponse

    // Mutes console warning
    console.warn = jest.fn()

    return detectGeolocation()
      .then(response => {
        expect(response.timeout).toEqual(true)
        done()
      })
  })

  it('on request timeout, records geolocation service contact was attempted', (done) => {
    window.fetch = timeoutResponse

    // Mutes console warning
    console.warn = jest.fn()

    return detectGeolocation()
      .then(() => {
        const state = wasGeolocationAttempted()
        expect(state).toEqual(true)
        done()
      })
  })
})
