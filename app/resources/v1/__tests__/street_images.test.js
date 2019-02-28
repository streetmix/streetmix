/* eslint-env jest */
import request from 'supertest'
import cloudinary from 'cloudinary'
import { setupMockServer } from '../../../../test/helpers/setup-mock-server'
import images from '../street_images'

jest.mock('../../../models/street')
jest.mock('../../../models/user')
jest.mock('../../../../lib/logger')
jest.mock('cloudinary')

const street = {
  _id: '5b06a6544a62a14ae7467e37',
  status: 'ACTIVE',
  id: '3e888ae0-5f48-11e8-82e7-c3447c17015a',
  namespaced_id: 65,
  updated_at: '2018-05-24T11:47:33.041Z',
  created_at: '2018-05-24T11:47:32.721Z',
  __v: 0,
  data: { }
}

describe('POST api/v1/streets/images/:street_id', () => {
  const app = setupMockServer((app) => {
    app.post('/api/v1/streets/images/:street_id', images.post)
  })

  cloudinary.v2.uploader.upload.mockResolvedValue('foo')

  it('should respond with 200 Ok when a data url is sent', () => {
    return request(app)
      .post(`/api/v1/streets/images/${street.id}`)
      .set('Authorization', 'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-1111111111111" userId="user1"')
      .type('text/plain')
      .send('bar')
      .then((response) => {
        expect(response.statusCode).toEqual(200)
      })
  })

  it('should respond with 404 when user is not owner of street', () => {
    return request(app)
      .post(`/api/v1/streets/images/${street.id}`)
      .set('Authorization', 'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-2222222222222" userId="user2"')
      .type('text/plain')
      .send('bar')
      .then((response) => {
        expect(response.statusCode).toEqual(404)
      })
  })
})
