'use strict'

module.exports = {
  up: (queryInterface) => {
    return queryInterface.addIndex('Streets', ['namespaced_id', 'creator_id'])
  },

  down: (queryInterface) => {
    queryInterface.removeIndex('Streets', ['namespaced_id', 'creator_id'])
  },
}
