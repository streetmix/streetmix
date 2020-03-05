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
      database: 'streetmix_test',
      host: process.env.PGHOST || '127.0.0.1',
      port: process.env.PGPORT || 5432
    }
  },
  l10n: {
    use_local: true
  }
}
