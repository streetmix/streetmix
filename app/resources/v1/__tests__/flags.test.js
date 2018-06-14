/* eslint-env jest */
import request from 'supertest'
import express from 'express'
import flags from '../flags'

function setupMockServer () {
  const app = express()

  app.get('/api/v1/flags', flags.get)

  return app
}

describe('get api/v1/flags', function () {
  const app = setupMockServer()

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
