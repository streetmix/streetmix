import request from 'supertest'
import { setupMockServer } from '../../../test/setup-mock-server'
import * as translate from '../translate'

// TODO: The test can fail if Transifex is unreachable. May need to rewrite
// api controller to fallback to local translation strings if a connection cannot
// be made (and add a log entry)

describe('get api/v1/translate', function () {
  const app = setupMockServer((app) => {
    app.get('/api/v1/translate/:locale_code/:resource_name', translate.get)
  })

  it('makes a request for a translation file', () => {
    return request(app)
      .get('/api/v1/translate/en/main')
      .then((response) => {
        expect(response.statusCode).toEqual(200)
        expect(response.get('Content-Type').toLowerCase()).toEqual(
          'application/json; charset=utf-8'
        )
        expect(response.body.dialogs.welcome.heading).toEqual(
          'Welcome to Streetmix.'
        )
      })
  })

  it.todo('falls back to local files if API token is not provided')
})
