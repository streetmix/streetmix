module.exports = {
  app_host_port: 'streetmix.net',
  header_host_port: 'streetmix.net',
  restapi: {
    protocol: 'https://',
    baseuri: '/api'
  },
  facebook_app_id: '162729607241489',
  google_analytics_account: 'UA-38087461-1',
  mixpanel_token: '61e4b1fdd39e00551df8911fe62b8c56',
  db: {
    // MONGOHQ_URL - Compose MongoDB Heroku addon
    url: process.env.MONGOHQ_URL || 'mongodb://localhost/streetmix'
  },
  l10n: {
    use_local: true
  }
}
