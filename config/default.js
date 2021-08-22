const port = process.env.PORT || 8000
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

module.exports = {
  env: process.env.NODE_ENV,
  port: port,
  app_host_port: process.env.APP_DOMAIN || 'localhost:' + port,
  restapi_proxy_baseuri_rel: '/api',
  restapi: {
    port: port,
    protocol: 'http://',
    baseuri: '/api'
  }
}
