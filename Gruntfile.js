var path = require('path')

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt)
  grunt.initConfig({
    env: {
      test: {
        NODE_ENV: 'test'
      }
    },
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
      },
      saucelabs: {
        options: {
          configFile: './test/integration/saucelabs.conf.js',
          args: {
            sauceUser: process.env.SAUCE_USERNAME,
            sauceKey: process.env.SAUCE_ACCESS_KEY
          }
        }
      }
    },
    shell: {
      options: {
        stderr: false
      },
      target: {
        command: './node_modules/grunt-protractor-runner/scripts/webdriver-manager-update'
      }
    }
  })
  grunt.registerTask('test:travis', ['env:test', 'express:app', 'protractor:saucelabs'])
  grunt.registerTask('test:local:setup', ['shell'])
  grunt.registerTask('test:local', ['env:test', 'express:app', 'protractor:local'])
}
