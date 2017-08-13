/* eslint-env jest */
import request from 'supertest'
import express from 'express'
import translate from '../translate'

// TODO: The test can fail if Transifex is unreachable. May need to rewrite
// api controller to fallback to local translation strings if a connection cannot
// be made (and add a log entry)

function setupMockServer () {
  const app = express()

  app.get('/api/v1/translate/:locale_code/:resource_name', translate.get)

  return app
}

describe('get api/v1/translate', function () {
  const app = setupMockServer()

  it('makes a request for a translation file', () => {
    return request(app)
      .get('/api/v1/translate/en/main')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .then((response) => {
        const translation = response.body
        expect(translation.dialogs.welcome.heading).toEqual('Welcome to Streetmix.')
      })
  })
})
