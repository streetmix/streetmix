'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query(
      'SELECT id, auth0_id, display_name, email, identities, profile_image_url, flags, data FROM "Users"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )

    const validUsers = users.filter((user) => {
      const isValidAuth0Id = typeof user.auth0_id === 'string' && user.auth0_id.trim() !== ''
      const isValidDisplayName = typeof user.display_name === 'string' && user.display_name.length <= 30
      const isValidEmail = typeof user.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)
      const isValidProfileImageUrl = typeof user.profile_image_url === 'string' && user.profile_image_url.length <= 2048 && /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(user.profile_image_url)
      const isValidIdentities = typeof user.identities === 'object'
      const isValidFlags = typeof user.flags === 'object'
      const isValidData = typeof user.data === 'object'

      return isValidAuth0Id && isValidDisplayName && isValidEmail && isValidProfileImageUrl && isValidIdentities && isValidFlags && isValidData
    })

    if (validUsers.length !== users.length) {
      throw new Error('Validation failed for some test users')
    }
  },

  down: async (queryInterface, Sequelize) => {
    // No need to revert validation logic
  }
}
