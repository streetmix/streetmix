/* eslint-env jest */
import request from 'supertest'
import { setupMockServer } from '../../../../test/helpers/setup-mock-server'
import session from '../user_session'

jest.mock('../../../models/user')
jest.mock('../../../../lib/logger')

describe('DELETE api/v1/users/:user_id', function () {
  const app = setupMockServer((app) => {
    app.delete('/api/v1/users/:user_id', session.delete)
  })

  it('should respond with 204 No content when user signs out', function () {
    return request(app)
      .delete('/api/v1/users/user1')
      .set('Authorization', 'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-1111111111111" userId="user1"')
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })
})
