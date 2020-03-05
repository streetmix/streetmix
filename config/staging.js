module.exports = {
  app_host_port: 'streetmix-staging.herokuapp.com',
  header_host_port: 'streetmix-staging.herokuapp.com',
  restapi: {
    baseuri: '/api',
    protocol: 'https://'
  },
  facebook_app_id: '175861739245183',
  db: {
    sequelize: {
      // The `url` property is documented in sequelize-cli readme but not in Sequelize core
      url: process.env.DATABASE_URL
    }
  },
  l10n: {
    use_local: false
  }
}
