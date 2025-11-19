'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.query(`
      ALTER TABLE "Streets"
      ALTER COLUMN id
      TYPE uuid USING id::uuid
    `)
    // Sequelize will refuse to run the `changeColumn` command because, and
    // I quote, `ERROR: column "id" is in a primary key`. So we just run the
    // bare query above instead.
    // return queryInterface.changeColumn('Streets', 'id', {
    //   type: Sequelize.DataTypes.UUID
    // })
  },

  async down(queryInterface) {
    return queryInterface.sequelize.query(`
      ALTER TABLE "Streets"
      ALTER COLUMN id
      TYPE varchar(255)
    `)
    // Sequelize will refuse to run the `changeColumn` command -- see above.
    // return queryInterface.changeColumn('Streets', 'id', {
    //   type: Sequelize.DataTypes.STRING
    // })
  },
}
