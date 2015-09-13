var port = 3000

module.exports = {
  port: port,
  app_host_port: '127.0.0.1:' + port,
  header_host_port: '127.0.0.1:' + port,
  restapi: {
    port: port,
    baseuri: '/api'
  },
  db: {
    url: 'mongodb://127.0.0.1/streetmix_test'
  },
  email: {
    feedback_recipient: 'nobody@example.com'
  }
}
