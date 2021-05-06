'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Increases the length of a social profile image URL beyond the default
    // value of 255 characters. Although there's no standard maximum length
    // of a URL, a common rule of thumb is that URLs should not be longer than
    // 2083 as this is the maximum length supported by IE. Despite this, it
    // should be reasonable to expect that the URLs in this particular use case
    // would not be longer than 1024 characters. See the issue at
    // https://github.com/streetmix/streetmix/issues/2335 for more information.
    await queryInterface.changeColumn('Users', 'profile_image_url', {
      type: Sequelize.STRING(1024)
    })
  },

  down: async (queryInterface, Sequelize) => {
    // If rolling back, this should set the column back to the original STRING
    // definition, with a maximum value of 255 characters.
    //
    // According to PostgreSQL documentation:
    // "...an over-length value will be truncated to n characters without
    // raising an error. (This too is required by the SQL standard.)"
    // https://www.postgresql.org/docs/current/datatype-character.html
    //
    // Thus, be aware that this can cause data loss if there is a long URL that
    // becomes truncated by this rollback.
    await queryInterface.changeColumn('Users', 'profile_image_url', {
      type: Sequelize.STRING
    })
  }
}
