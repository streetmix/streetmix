exports.config = {
  chromeOnly: true,
  capabilities: {
    'browserName': 'chrome'
  },
  specs: ['./*.spec.js'],
  baseUrl: 'http://localhost:' + (process.env.HTTP_PORT || '3000')
}
