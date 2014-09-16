var port = 3000;

module.exports = {
  port: port,
  app_host_port: '127.0.0.1:' + port,
  header_host_port: '127.0.0.1:' + port,
  restapi_baseuri: 'http://127.0.0.1:' + port + '/api',
  restapi: {
    port: port,
    baseuri: 'http://127.0.0.1:' + port + '/api'
  },
  db: {
    url: 'mongodb://127.0.0.1/streetmix_test'
  }
}
