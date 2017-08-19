/* eslint-env jest */
module.exports = function (username, password) {
  // Normally, sendgrid expects username and password. We are not testing
  // authentication here, so the stub throws credentials away.
  return {
    send: function (data, callback) {
      // Throw data away and executes callback, passing null to err
      // and empty string to response to simulate success
      callback(null, '')
    }
  }
}
