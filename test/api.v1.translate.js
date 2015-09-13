'use strict'

var path = require('path')
var test = require('tape-catch')
var request = require('supertest')

// TODO: The test can fail if Transifex is unreachable. May need to rewrite
// api controller to fallback to local translation strings if a connection cannot
// be made (and add a log entry)

function setupMockServer () {
  var express = require('express')
  var app = express()
  var translate = require(path.join(process.cwd(), '/app/resources/v1/translate'))

  app.get('/api/v1/translate/:locale_code', translate.get)

  return app
}

test('get api/v1/translate', function (t) {
  t.plan(3)

  var app = setupMockServer()

  request(app)
    .get('/api/v1/translate/en-US')
    .end(function (err, res) {
      if (err) {
        t.error(err)
      }

      t.equal(res.statusCode, 200, 'should respond ok')
      t.equal(res.get('Content-Type').toLowerCase(), 'application/json; charset=utf-8', 'should be utf-8 json')
      t.equal(res.body.dialogs.welcome.heading, 'Welcome to Streetmix.', 'should be able to read a translation string')
    })
})
