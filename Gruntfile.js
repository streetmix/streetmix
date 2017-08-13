var path = require('path')

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt)
  grunt.initConfig({
    express: {
      app: {
        options: {
          server: path.resolve(__dirname, 'app.js'),
          port: process.env.PORT || 3000
        }
      }
    },
    protractor: {
      local: {
        options: {
          configFile: './test/integration/local.conf.js',
          keepAlive: true,
          noColor: false,
          args: {}
        }
      }
    }
  })
  grunt.registerTask('test:local', ['express:app', 'protractor:local'])
}
