'use strict'

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addIndex('Streets', ['original_street_id'])
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('Streets', ['original_street_id'])
  },
}
