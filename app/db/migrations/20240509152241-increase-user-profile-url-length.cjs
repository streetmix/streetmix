'use strict'

// Following up from 20210506170155-update-user-profile-url
// we've found that in some rare cases, a googleusercontent.com
// URL exceeds the 1024 character limit by just a little bit.
// So let's just go ahead and double the URL length.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'profile_image_url', {
      type: Sequelize.STRING(2048),
    })
  },

  async down(queryInterface, Sequelize) {
    // See the comment in 20210506170155-update-user-profile-url
    // for why we use this pattern here when we roll back this step.
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `
          UPDATE "Users"
          SET profile_image_url = profile_image_url::varchar(1024)
          WHERE CHAR_LENGTH(profile_image_url) > 1024
        `,
          { transaction: t }
        ),
        queryInterface.changeColumn(
          'Users',
          'profile_image_url',
          {
            type: Sequelize.STRING(1024),
          },
          { transaction: t }
        ),
      ])
    })
  },
}
