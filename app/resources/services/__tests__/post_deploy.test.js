/* eslint-env jest */
import request from 'supertest'
import express from 'express'
import postDeploy from '../post_deploy'

const SERVICE_PATH = '/services/post-deploy/'

function setupMockServer () {
  const app = express()

  // Only allow query-string URL-encoded data
  app.post(SERVICE_PATH, express.urlencoded({ extended: false }), postDeploy.post)

  return app
}

describe('POST /services/post-deploy', () => {
  const app = setupMockServer()
  const samplePayload = 'app=secure-woodland-9775&user=example%40example.com&url=http%3A%2F%2Fsecure-woodland-9775.herokuapp.com&head=4f20bdd&head_long=4f20bdd&prev_head=&git_log=%20%20*%20Michael%20Friis%3A%20add%20bar&release=v7'

  it('should respond with 202 accepted when message is sent', function () {
    // POST with sample payload
    // Heroku HTTP deploy hook payloads are sent with the application/x-www-form-urlencoded content-type
    return request(app)
      .post(SERVICE_PATH)
      .type('form')
      .send(samplePayload)
      .then((response) => {
        expect(response.statusCode).toEqual(202)
      })
  })

  it('should respond with 400 bad request when no message is sent', function () {
    // POST with empty payload
    return request(app)
      .post(SERVICE_PATH)
      .type('form')
      .send(null)
      .then((response) => {
        expect(response.statusCode).toEqual(400)
      })
  })

  it('should respond with 400 bad request when the wrong content type is sent', function () {
    // POST with the wrong content type
    return request(app)
      .post(SERVICE_PATH)
      .type('json')
      .send(JSON.stringify({ foo: 'bar' }))
      .then((response) => {
        expect(response.statusCode).toEqual(400)
      })
  })
})
