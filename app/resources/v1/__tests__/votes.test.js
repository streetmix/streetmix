import { vi } from 'vitest'
import request from 'supertest'
import { setupMockServer } from '../../../test/setup-mock-server'
import * as votes from '../votes'

const TEST_USER_ONE = 'user1'
const TEST_USER_AUTH0_ONE = 'foo|123'
const TEST_STREET_TWO = 'testStreetId2'
const TEST_VOTE_ONE = 'vote1'

vi.mock('../../../db/models')
vi.mock('../../../lib/logger')

const TEST_COMMENT = 'some nice comment goes here :)'
const TEST_COMMENT_MAX_LEN =
  'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat mass'

const mockUser = {
  sub: TEST_USER_AUTH0_ONE
}

const MOCK_VOTE_TWO = {
  streetId: TEST_STREET_TWO,
  score: 0
}

const voteByUser = 'vote1'
const voteByOtherUser = 'vote2'

const jwtMock = vi.fn() // returns a user
const mockUserMiddleware = (req, res, next) => {
  req.auth = jwtMock()
  next()
}

describe('api/v1/votes', function () {
  const app = setupMockServer((app) => {
    app.post('/api/v1/votes', mockUserMiddleware, votes.post)
    app.get('/api/v1/votes', mockUserMiddleware, votes.get)
    app.put('/api/v1/votes', mockUserMiddleware, votes.put)
  })

  it('should fetch the only available vote for test user', function () {
    jwtMock.mockReturnValueOnce(mockUser)
    return request(app)
      .get('/api/v1/votes')
      .then((response) => {
        expect(response.statusCode).toEqual(200)
        const { ballots } = response.body
        expect(ballots.length).toEqual(1)
        const { id } = ballots[0]
        expect(id).toEqual(TEST_VOTE_ONE)
      })
  })

  it('should allow user to vote', function () {
    jwtMock.mockReturnValueOnce(mockUser)
    return request(app)
      .post('/api/v1/votes')
      .type('json')
      .send(JSON.stringify(MOCK_VOTE_TWO))
      .then((response) => {
        const { ballot } = response.body
        expect(response.statusCode).toEqual(200)
        expect(ballot.voterId).toEqual(TEST_USER_ONE)
        expect(ballot.streetId).toEqual(TEST_STREET_TWO)

        jwtMock.mockReturnValueOnce(mockUser)
        request(app)
          .put('/api/v1/votes')
          .type('json')
          .send(
            JSON.stringify({
              id: ballot.id,
              comment: TEST_COMMENT
            })
          )
          .then((commentResponse) => {
            expect(commentResponse.statusCode).toEqual(200)
          })
      })
  })

  it('should block user commenting over 280 characters', function () {
    jwtMock.mockReturnValueOnce(mockUser)
    return request(app)
      .put('/api/v1/votes')
      .type('json')
      .send(
        JSON.stringify({
          id: voteByUser,
          comment: TEST_COMMENT_MAX_LEN
        })
      )
      .then((response) => {
        expect(response.statusCode).toEqual(413)
      })
  })

  it('should block user commenting on a vote by another user', function () {
    jwtMock.mockReturnValueOnce(mockUser)
    return request(app)
      .put('/api/v1/votes')
      .type('json')
      .send(
        JSON.stringify({
          id: voteByOtherUser,
          comment: TEST_COMMENT
        })
      )
      .then((response) => {
        expect(response.statusCode).toEqual(403)
      })
  })

  // TODO: implement this once we can test for the elimination of votes from the pool
  // Specifically POSTing to all available votes should cause a 204 code to return
  // it('should return 204 if no votes remain', function () {
  //   jwtMock.mockReturnValueOnce(mockUser)
  //   return request(app)
  //     .get('/api/v1/votes')
  //     .then((response) => {
  //       expect(response.statusCode).toEqual(204)
  //     })
  // })
})
