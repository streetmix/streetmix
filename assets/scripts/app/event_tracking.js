/* global ga */
'use strict'

// Contains identifiers for actions that should only be tracked
// once per user session, as defined by the boolean value of
// onlyFirstTime passed to eventTracking.track()
var alreadyTracked = []

function track (category, action, label, value, onlyFirstTime) {
  if (typeof ga === 'undefined') return

  if (onlyFirstTime) {
    var id = category + '|' + action + '|' + label

    if (alreadyTracked[id]) {
      return
    }
  }

  // console.log('Event tracked', category, action, label)

  ga && ga('send', 'event', category, action, label, value)

  if (onlyFirstTime) {
    alreadyTracked[id] = true
  }
}

module.exports = {
  track: track
}
