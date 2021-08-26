const port = 8000

module.exports = {
  port: port,
  app_host_port: process.env.APP_DOMAIN || 'localhost:' + port,
  restapi: {
    port: port
  }
}
