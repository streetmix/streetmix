module.exports = {
  app_host_port: 'streetmix.net',
  header_host_port: 'streetmix.net',
  restapi_baseuri: 'http://streetmix.net/api',
  restapi: {
    baseuri: 'http://streetmix.net/api'
  },
  facebook_app_id: '162729607241489',
  google_analytics_account: 'UA-38087461-1',
  email: {
    feedback_recipient: process.env.EMAIL_FEEDBACK_RECIPIENT || "streetmix@codeforamerica.org",
    feedback_subject: "Streetmix feedback",
    feedback_sender_default: "noreply@codeforamerica.org"
  }
}
