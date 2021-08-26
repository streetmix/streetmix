const port = process.env.PORT || 8000
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

module.exports = {
  port: port,
  app_host_port: process.env.APP_DOMAIN || 'localhost:' + port,
  restapi: {
    port: port,
    protocol: 'http://'
  }
}
