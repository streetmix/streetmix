/* eslint-env jest */
import request from 'supertest'
import { setupMockServer } from '../../../../test/helpers/setup-mock-server'
import votes from '../votes'
import { queryInterface, Sequelize } from '../../../db/models'
import { up, down } from '../../../db/seeders/votes'

const TEST_USER_ONE = 'testUserId1'
const TEST_USER_AUTH0_ONE = 'testUserAuth0Id1'
const TEST_USER_TWO = 'testUserId2'
const TEST_STREET_ONE = 'testStreetId1'
const TEST_STREET_TWO = 'testStreetId2'
const TEST_USER_AUTH0_TWO = 'testUserAuth0Id2'
const TEST_VOTE_ONE = 'testVoteId1'
const TEST_VOTE_TWO = 'testVoteId2'

jest.mock('../../../../lib/logger')

const TEST_COMMENT = 'some nice comment goes here :)'
const TEST_COMMENT_MAX_LEN =
  'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat mass'

const mockUser = {
  sub: TEST_USER_AUTH0_ONE
}

const mockOtherUser = {
  sub: TEST_USER_AUTH0_TWO
}

const MOCK_VOTE_ONE = {
  streetId: TEST_STREET_ONE,
  score: 0
}
const MOCK_VOTE_TWO = {
  streetId: TEST_STREET_TWO,
  score: 0
}

const jwtMock = jest.fn() // returns a user
const mockUserMiddleware = (req, res, next) => {
  req.user = jwtMock()
  next()
}

describe('api/v1/votes', function () {
  beforeAll(async () => {
    try {
      await up(queryInterface, Sequelize)
    } catch (err) {
      console.log('Error!', err)
    }
  })

  afterAll(() => {
    try {
      down(queryInterface, Sequelize)
    } catch (err) {
      console.log('Error!', err)
    }
  })

  const app = setupMockServer((app) => {
    app.post('/api/v1/votes', mockUserMiddleware, votes.post)
    app.get('/api/v1/votes', mockUserMiddleware, votes.get)
    app.put('/api/v1/votes', mockUserMiddleware, votes.put)
  })

  let voteByOtherUser

  it('should fetch the only available vote for test user 1', function () {
    jwtMock.mockReturnValueOnce(mockUser)
    return request(app)
      .get('/api/v1/votes')
      .then((response) => {
        expect(response.statusCode).toEqual(200)
        const { ballots } = response.body
        expect(ballots.length).toEqual(1)
        const { id } = ballots[0]
        expect(id).toEqual(TEST_VOTE_TWO)
      })
  })

  it('should fetch the only available vote for test user 2', function () {
    jwtMock.mockReturnValueOnce(mockOtherUser)
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

  it('should allow user 1 to vote', function () {
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
        voteByOtherUser = ballot.id

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

  it('should block user 1 commenting over 280 characters', function () {
    jwtMock.mockReturnValueOnce(mockUser)
    return request(app)
      .put('/api/v1/votes')
      .type('json')
      .send(
        JSON.stringify({
          id: voteByOtherUser,
          comment: TEST_COMMENT_MAX_LEN
        })
      )
      .then((response) => {
        expect(response.statusCode).toEqual(413)
      })
  })

  it('should block user 2 commenting on a vote by user 1', function () {
    jwtMock.mockReturnValueOnce(mockOtherUser)
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

  it('should return 204 if no votes remain', function () {
    jwtMock.mockReturnValueOnce(mockUser)
    return request(app)
      .get('/api/v1/votes')
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })

  it('should fetch the still-available vote as test user 2', function () {
    jwtMock.mockReturnValueOnce(mockOtherUser)
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

  it('should allow user 2 to vote', function () {
    jwtMock.mockReturnValueOnce(mockOtherUser)
    return request(app)
      .post('/api/v1/votes')
      .type('json')
      .send(JSON.stringify(MOCK_VOTE_ONE))
      .then((response) => {
        const { ballot } = response.body
        expect(response.statusCode).toEqual(200)
        expect(ballot.voterId).toEqual(TEST_USER_TWO)
        expect(ballot.streetId).toEqual(TEST_STREET_ONE)
      })
  })
})
