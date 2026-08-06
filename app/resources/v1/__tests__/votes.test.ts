import { vi } from 'vitest'
import request from 'supertest'

import {
  createMockAuthMiddleware,
  setupMockServer,
} from '../../../test/setup-mock-server.ts'
import {
  makeStreetFixture,
  makeUserFixture,
  makeVoteFixture,
} from '../../../test/model-fixtures.ts'
import * as votes from '../votes.ts'

import type { Mock } from 'vitest'

const TEST_USER_ONE = 'user1'
const TEST_STREET_TWO = 'testStreetId2'
const TEST_VOTE_ONE = 'vote1'

const voteFindAllMock = vi.hoisted(() =>
  vi.fn(async () => [
    makeVoteFixture({
      id: TEST_VOTE_ONE,
      streetId: TEST_STREET_TWO,
    }),
  ])
)

vi.mock('../../../db/models/index.ts', () => ({
  User: {
    findOne: vi.fn(async (query) => {
      const auth0Id = query?.where?.auth0Id

      if (auth0Id === 'foo|123') {
        return makeUserFixture({
          id: TEST_USER_ONE,
          auth0Id,
        })
      }

      return null
    }),
  },
  Street: {
    findOne: vi.fn(async () =>
      makeStreetFixture({
        id: TEST_STREET_TWO,
        creatorId: 'user2',
        status: 'ACTIVE',
      })
    ),
  },
  Vote: {
    findAll: voteFindAllMock,
    findOne: vi.fn(async (query) => {
      const where = query?.where ?? {}

      if (
        (where.id === voteByUser || where.id === createdVoteId) &&
        where.voterId === TEST_USER_ONE
      ) {
        return {
          ...makeVoteFixture({
            id: where.id,
            voterId: TEST_USER_ONE,
            streetId: TEST_STREET_TWO,
          }),
          save: vi.fn(async function (this: Record<string, unknown>) {
            return this
          }),
        }
      }

      return null
    }),
    create: vi.fn(async (payload) =>
      makeVoteFixture({
        ...payload,
        id: 'vote-created',
      })
    ),
    update: vi.fn(async () => [1]),
  },
}))

const TEST_COMMENT = 'some nice comment goes here :)'
const TEST_COMMENT_MAX_LEN =
  'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat mass'

const MOCK_VOTE_TWO = {
  streetId: TEST_STREET_TWO,
  score: 0,
}

const voteByUser = 'vote1'
const voteByOtherUser = 'vote2'
const createdVoteId = 'vote-created'
const { mockUserMiddleware } = createMockAuthMiddleware()

describe('api/v1/votes', function () {
  const app = setupMockServer((app) => {
    app.post('/api/v1/votes', mockUserMiddleware, votes.post)
    app.get('/api/v1/votes', mockUserMiddleware, votes.get)
    app.put('/api/v1/votes', mockUserMiddleware, votes.put)
  })

  it('should fetch the only available vote for test user', function () {
    return request(app)
      .get('/api/v1/votes')
      .then((response) => {
        expect(response.statusCode).toEqual(200)
        const { ballots } = response.body
        expect(ballots.length).toEqual(1)
        const { id } = ballots[0]
        expect(id).toEqual(TEST_VOTE_ONE)
        expect((voteFindAllMock as Mock).mock.calls.length).toBeGreaterThan(0)
        return
      })
  })

  it('should allow user to vote', async function () {
    const response = await request(app)
      .post('/api/v1/votes')
      .type('json')
      .send(JSON.stringify(MOCK_VOTE_TWO))

    const { ballot } = response.body
    expect(response.statusCode).toEqual(200)
    expect(ballot.voterId).toEqual(TEST_USER_ONE)
    expect(ballot.streetId).toEqual(TEST_STREET_TWO)

    const commentResponse = await request(app)
      .put('/api/v1/votes')
      .type('json')
      .send(
        JSON.stringify({
          id: ballot.id,
          comment: TEST_COMMENT,
        })
      )

    expect(commentResponse.statusCode).toEqual(200)
  })

  it('should block user commenting over 280 characters', function () {
    return request(app)
      .put('/api/v1/votes')
      .type('json')
      .send(
        JSON.stringify({
          id: voteByUser,
          comment: TEST_COMMENT_MAX_LEN,
        })
      )
      .then((response) => {
        expect(response.statusCode).toEqual(413)
        return
      })
  })

  it('should block user commenting on a vote by another user', function () {
    return request(app)
      .put('/api/v1/votes')
      .type('json')
      .send(
        JSON.stringify({
          id: voteByOtherUser,
          comment: TEST_COMMENT,
        })
      )
      .then((response) => {
        expect(response.statusCode).toEqual(403)
        return
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
