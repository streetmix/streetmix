'use strict'

const generateStreetData = (id) => ({
  street: {
    schemaVersion: 19,
    width: 80,
    id: id,
    namespacedId: 2,
    units: 1,
    location: {
      latlng: { lat: 40.787806, lng: -74.139989 },
      wofId: 'us/nj/statewide:a1826e81c48cb5a0',
      label: '114 Melrose Avenue, North Arlington, NJ, USA',
      hierarchy: {
        country: 'United States',
        region: 'New Jersey',
        locality: 'North Arlington',
        street: 'Melrose Avenue'
      },
      geometryId: '3bd6632e2fa1b53723def4062aa40f63',
      intersectionId: 'db0e6957d14004872a522115f8fb04ef'
    },
    userUpdated: true,
    environment: 'day',
    leftBuildingHeight: 4,
    rightBuildingHeight: 3,
    leftBuildingVariant: 'narrow',
    rightBuildingVariant: 'wide',
    segments: [
      {
        type: 'sidewalk',
        variantString: 'dense',
        width: 6,
        randSeed: 439049853
      },
      { type: 'sidewalk-tree', variantString: 'big', width: 2 },
      { type: 'bus-lane', variantString: 'inbound|shared', width: 12 },
      { type: 'bike-lane', variantString: 'inbound|green', width: 6 },
      { type: 'divider', variantString: 'bush', width: 4 },
      { type: 'transit-shelter', variantString: 'left|street-level', width: 9 },
      {
        type: 'sidewalk',
        variantString: 'normal',
        width: 24,
        randSeed: 506994825
      },
      { type: 'sidewalk-lamp', variantString: 'right|modern', width: 2 },
      { type: 'divider', variantString: 'planter-box', width: 11 },
      { type: 'sidewalk-lamp', variantString: 'left|modern', width: 2 },
      { type: 'sidewalk-tree', variantString: 'big', width: 2 }
    ],
    editCount: 17
  }
})
const TEST_USER_ONE = 'testUserId1'
const TEST_USER_TWO = 'testUserId2'
const TEST_STREET_ONE = 'testStreetId1'
const TEST_STREET_TWO = 'testStreetId2'
const TEST_VOTE_ONE = 'testVoteId1'
const TEST_VOTE_TWO = 'testVoteId2'

const MOCK_USERS = [
  {
    id: TEST_USER_ONE,
    auth0_id: 'testUserAuth0Id1',
    email: 'test1@streetmix.net',
    created_at: '2020-06-10 14:42:28.732796+00',
    updated_at: '2020-06-10 14:42:28.732796+00'
  },
  {
    id: TEST_USER_TWO,
    auth0_id: 'testUserAuth0Id2',
    email: 'test2@streetmix.net',
    created_at: '2020-06-10 14:42:28.732796+00',
    updated_at: '2020-06-10 14:42:28.732796+00'
  }
]

const MOCK_STREETS = [
  {
    data: JSON.stringify(generateStreetData(TEST_STREET_ONE)),
    id: TEST_STREET_ONE,
    creator_id: TEST_USER_ONE,
    created_at: '2020-06-10 14:42:28.732796+00',
    updated_at: '2020-06-10 14:42:28.732796+00'
  },
  {
    data: JSON.stringify(generateStreetData(TEST_STREET_TWO)),
    id: TEST_STREET_TWO,
    creator_id: TEST_USER_TWO,
    created_at: '2020-06-10 14:42:28.732796+00',
    updated_at: '2020-06-10 14:42:28.732796+00'
  }
]

const MOCK_VOTES = [
  {
    data: JSON.stringify(generateStreetData(TEST_STREET_ONE)),
    id: TEST_VOTE_ONE,
    street_id: TEST_STREET_ONE,
    voter_id: null,
    created_at: '2020-06-10 14:42:28.732796+00',
    updated_at: '2020-06-10 14:42:28.732796+00'
  },
  {
    data: JSON.stringify(generateStreetData(TEST_STREET_TWO)),
    id: TEST_VOTE_TWO,
    street_id: TEST_STREET_TWO,
    voter_id: null,
    created_at: '2020-06-10 14:42:28.732796+00',
    updated_at: '2020-06-10 14:42:28.732796+00'
  }
]

const getMockId = (item) => item.id

module.exports = {
  async up (queryInterface, Sequelize) {
    const Op = Sequelize.Op
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.bulkDelete(
        'Users',
        { id: { [Op.in]: MOCK_USERS.map(getMockId) } },
        { transaction }
      )
      await queryInterface.bulkDelete(
        'Streets',
        { id: { [Op.in]: MOCK_STREETS.map(getMockId) } },
        { transaction }
      )
      await queryInterface.bulkDelete(
        'Votes',
        { street_id: { [Op.in]: MOCK_STREETS.map(getMockId) } },
        { transaction }
      )
      await queryInterface.bulkInsert('Users', MOCK_USERS, { transaction })
      await queryInterface.bulkInsert('Streets', MOCK_STREETS, { transaction })
      await queryInterface.bulkInsert('Votes', MOCK_VOTES, { transaction })
      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  },
  down: (queryInterface, Sequelize) => {
    const Op = Sequelize.Op
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.bulkDelete(
          'Users',
          { id: { [Op.in]: MOCK_USERS.map(getMockId) } },
          { transaction: t }
        ),
        queryInterface.bulkDelete(
          'Streets',
          { id: { [Op.in]: MOCK_STREETS.map(getMockId) } },
          { transaction: t }
        ),
        queryInterface.bulkDelete(
          'Votes',
          { street_id: { [Op.in]: MOCK_STREETS.map(getMockId) } },
          { transaction: t }
        )
      ])
    })
  }
}
