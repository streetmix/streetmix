/* eslint-env jest */
import request from 'supertest'
import { setupMockServer } from '../../../../test/helpers/setup-mock-server'
import flags from '../flags'

describe('get api/v1/flags', function () {
  const app = setupMockServer((app) => {
    app.get('/api/v1/flags', flags.get)
  })

  it('makes a request for a flag file', () => {
    return request(app)
      .get('/api/v1/flags')
      .then((response) => {
        expect(response.statusCode).toEqual(200)
        expect(response.get('Content-Type').toLowerCase()).toEqual('application/json; charset=utf-8')
        expect(response.body.GEOTAG.label).toEqual('UI — Geotagging')
      })
  })
})
