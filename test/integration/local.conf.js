exports.config = {
  chromeOnly: true,
  chromeDriver: '../../node_modules/protractor/selenium/chromedriver',
  capabilities: {
    'browserName': 'chrome'
  },
  specs: ['./*.spec.js'],
  baseUrl: 'http://localhost:' + (process.env.HTTP_PORT || '3000')
}
