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
      type: Sequelize.STRING(1024),
    })
  },

  down: async (queryInterface, Sequelize) => {
    // If rolling back, this should set the column back to the original STRING
    // definition, with a maximum value of 255 characters.
    //
    // Be aware that this will cause data loss if there is a URL longer than
    // 255 characters, as we will have to truncate it in order to restore the
    // original column length.
    //
    // According to PostgreSQL documentation:
    // "An attempt to store a longer string into a column of these types will
    // result in an error, unless the excess characters are all spaces, in
    // which case the string will be truncated to the maximum length. (This
    // somewhat bizarre exception is required by the SQL standard.)"
    // https://www.postgresql.org/docs/current/datatype-character.html
    //
    // Thus, this migration reversal requires two steps, wrapped in a
    // transaction for safety:
    // 1. First, we manually truncate all URLs longer than 255 to 255.
    // 2. Then, we change the column type to the original length.
    //
    // Apologies for the raw SQL. If Sequelize has an interface for this query,
    // please do replace.
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `
          UPDATE "Users"
          SET profile_image_url = profile_image_url::varchar(255)
          WHERE CHAR_LENGTH(profile_image_url) > 255
        `,
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'Users',
          'profile_image_url',
          {
            type: Sequelize.STRING,
          },
          { transaction: t }
        ),
      ])
    })
  },
}
