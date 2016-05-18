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
    },
    transifex: {
      streetmix: {
        options: {
          endpoint: 'https://www.transifex.com/api/2',
          targetDir: 'assets/locales',
          languages: ['en@pirate', 'fi', 'de', 'es', 'es_MX', 'pl', 'pt_BR'],
          filename: '_lang_/_resource_.json',
          templateFn: function (strings) {
            var o = {}, keys, tempO
            for (var s in strings) {
              keys = strings[s].key.split('.')
              tempO = o
              for (var i = 0; i < keys.length - 1; i++) {
                tempO = tempO[keys[i]] = tempO[keys[i]] || {}
              }
              tempO[keys[keys.length-1]] = strings[s].translation
            }

            var stringify = require('json-stable-stringify')
            return stringify(o, {space: 2}) + '\n'
          }
        }
      }
    }
  })
  grunt.registerTask('test:travis', (
    // Sauce-based tests cannot be performed on pull request open by user that
    // doesn't have write permission to main repository
    // https://docs.travis-ci.com/user/pull-requests/#Security-Restrictions-when-testing-Pull-Requests
    (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) ?
    ['env:test', 'express:app', 'protractor:saucelabs'] :
    ['env:test', 'express:app']
  ))
  grunt.registerTask('test:local:setup', ['shell'])
  grunt.registerTask('test:local', ['env:test', 'express:app', 'protractor:local'])
}
