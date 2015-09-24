var port = 3000

module.exports = {
  port: port,
  app_host_port: 'localhost:' + port,
  header_host_port: 'localhost:' + port,
  restapi: {
    port: port,
    baseuri: '/api'
  },
  db: {
    url: 'mongodb://localhost/streetmix_test'
  },
  email: {
    feedback_recipient: 'nobody@example.com'
  }
}
