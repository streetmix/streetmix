import type { InferAttributes } from 'sequelize'

import type { Street } from '../db/models/street.ts'
import type { User } from '../db/models/user.ts'
import type { Vote } from '../db/models/vote.ts'

type UserAttributes = InferAttributes<User>
type StreetAttributes = InferAttributes<Street>
type VoteAttributes = InferAttributes<Vote>

type UserFixture = UserAttributes & {
  toJSON: () => UserAttributes
}

export function makeUserFixture(
  overrides: Partial<UserAttributes> = {}
): UserFixture {
  const base = {
    id: 'user1',
    auth0Id: 'foo|123',
    email: 'test@test.com',
    identities: [] as unknown as UserAttributes['identities'],
    roles: ['USER'],
    profileImageUrl: 'https://avatar.com/picture.png',
    displayName: 'User One',
    data: {},
    flags: {},
    lastStreetId: 1,
    createdAt: new Date('2018-05-24T11:47:32.721Z'),
    updatedAt: new Date('2018-05-24T11:47:33.041Z'),
  } as unknown as UserAttributes

  const fixture = { ...base, ...overrides } as UserAttributes

  return {
    ...fixture,
    toJSON: () => fixture,
  }
}

export function makeStreetFixture(
  overrides: Partial<StreetAttributes> = {}
): StreetAttributes {
  const base = {
    id: 'street1',
    creatorId: 'user1',
    status: 'ACTIVE',
    namespacedId: 65,
    name: 'Test Street',
    updatedAt: new Date('2018-05-24T11:47:33.041Z'),
    createdAt: new Date('2018-05-24T11:47:32.721Z'),
    clientUpdatedAt: new Date('2018-05-24T11:47:33.041Z'),
    creatorIp: '127.0.0.1',
    originalStreetId: 'original-street',
    data: {
      street: {
        id: 'street1',
        namespacedId: 65,
        schemaVersion: 24,
        units: 0,
        width: 20,
        segments: [],
        boundary: {
          left: {
            id: 'street1-left',
            variant: 'narrow',
            floors: 2,
            elevation: 0,
          },
          right: {
            id: 'street1-right',
            variant: 'narrow',
            floors: 2,
            elevation: 0,
          },
        },
        skybox: 'clear',
        weather: null,
        location: null,
        showAnalytics: false,
        userUpdated: true,
        editCount: 0,
      },
      plugins: {},
    },
  } as unknown as StreetAttributes

  return { ...base, ...overrides } as StreetAttributes
}

export function makeVoteFixture(
  overrides: Partial<VoteAttributes> = {}
): VoteAttributes {
  const base = {
    id: 'vote1',
    voterId: 'user1',
    streetId: 'testStreetId2',
    data: {},
    comment: '',
    submitted: [],
    score: 0,
    createdAt: new Date('2018-05-24T11:47:32.721Z'),
    updatedAt: new Date('2018-05-24T11:47:33.041Z'),
  } as unknown as VoteAttributes

  return { ...base, ...overrides } as VoteAttributes
}
