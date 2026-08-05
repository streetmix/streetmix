type FixtureRecord = Record<string, unknown>

export function makeUserFixture(overrides: FixtureRecord = {}) {
  const base = {
    id: 'user1',
    auth0Id: 'foo|123',
    roles: ['USER'],
    profileImageUrl: 'https://avatar.com/picture.png',
    displayName: 'User One',
    data: {},
  }

  const fixture = { ...base, ...overrides }

  return {
    ...fixture,
    toJSON: () => ({ ...fixture }),
  }
}

export function makeStreetFixture(overrides: FixtureRecord = {}) {
  const base = {
    id: 'street1',
    creatorId: 'user1',
    status: 'ACTIVE',
    namespacedId: 65,
    name: 'Test Street',
    updatedAt: '2018-05-24T11:47:33.041Z',
    createdAt: '2018-05-24T11:47:32.721Z',
    clientUpdatedAt: '2018-05-24T11:47:33.041Z',
    data: {
      street: {
        schemaVersion: 24,
        boundary: {
          left: { variant: 'narrow', floors: 2 },
          right: { variant: 'narrow', floors: 2 },
        },
        segments: [],
      },
    },
  }

  return { ...base, ...overrides }
}

export function makeVoteFixture(overrides: FixtureRecord = {}) {
  return {
    id: 'vote1',
    voterId: 'user1',
    streetId: 'testStreetId2',
    data: {},
    ...overrides,
  }
}
