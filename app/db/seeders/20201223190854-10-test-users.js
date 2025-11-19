import { faker } from '@faker-js/faker'

const users = [...Array(10)].map((_) => ({
  id: faker.internet.username(),
  email: faker.internet.email(),
  created_at: new Date(),
  updated_at: new Date(),
}))

export default {
  up: async (queryInterface, _Sequelize) => {
    return queryInterface.bulkInsert('Users', users, {})
  },

  down: async (queryInterface, _Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {})
  },
}
