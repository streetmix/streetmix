module.exports = {
  app_host_port: process.env.APP_DOMAIN || 'streetmix-staging.herokuapp.com',
  restapi: {
    baseuri: '/api',
    protocol: 'https://'
  },
  facebook_app_id: '175861739245183',
  db: {
    sequelize: {
      // The `url` property is documented in sequelize-cli readme but not in Sequelize core
      url: process.env.DATABASE_URL,
      pool: {
        max: 12,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  }
}
