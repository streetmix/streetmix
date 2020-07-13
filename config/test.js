const port = 8000

module.exports = {
  port: port,
  app_host_port: 'localhost:' + port,
  header_host_port: 'localhost:' + port,
  restapi: {
    port: port,
    baseuri: '/api'
  },
  db: {
    sequelize: {
      // The `url` property is documented in sequelize-cli readme but not in Sequelize core
      url: process.env.DATABASE_URL,
      logging: false,
      pool: {
        max: 12,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  },
  l10n: {
    use_local: true
  }
}
