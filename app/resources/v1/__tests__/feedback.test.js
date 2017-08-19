/* eslint-env jest */
import request from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'
import feedback from '../feedback'

jest.mock('sendgrid')
jest.mock('../../../../lib/logger', () => function () {
  return {
    info: function () {},
    error: function () {}
  }
})

const transmission = {
  message: 'Hello!',
  from: 'test@streetmix.net',
  additionalInformation: 'User agent'
}

function setupMockServer () {
  const app = express()

  // Need body-parser middleware to handle JSON request body
  app.use(bodyParser.json())
  app.post('/api/v1/feedback', feedback.post)

  return app
}

describe('post api/v1/feedback', function () {
  const app = setupMockServer()

  it('should respond with 202 accepted when message is sent', function () {
    // Post to feedback with transmission
    return request(app)
      .post('/api/v1/feedback/')
      .type('json')
      .send(JSON.stringify(transmission))
      .then((response) => {
        expect(response.statusCode).toEqual(202)
      })
  })

  it('should respond with 400 bad request when no message is sent', function () {
    // Post to feedback with invalid transmission
    return request(app)
      .post('/api/v1/feedback/')
      .type('json')
      .send('')
      .then((response) => {
        expect(response.statusCode).toEqual(400)
      })
  })
})
