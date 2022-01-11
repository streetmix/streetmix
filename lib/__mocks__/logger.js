/**
 * Mocks logger module for testing.
 *
 * During a test, server-side log output is noise. If a test must
 * log for debugging, use a console.log() and then remove it before
 * committing. Only use the logger functionality for output that is
 * intended to be recorded in persistent logs.
 */

module.exports = {
  info: function () {},
  error: function () {},
  debug: function () {}
}
