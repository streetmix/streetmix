// Currently, these constants are global to the system
// TODO: Alternative strategy in the future is make them part of the API of the module
var TRACK_CATEGORY_INTERACTION = 'Interaction'
var TRACK_CATEGORY_EVENT = 'Event'
var TRACK_CATEGORY_ERROR = 'Error'
var TRACK_CATEGORY_SYSTEM = 'System'

var EventTracking = (function () {
  'use strict'

  /* global ga */
  // TODO: Require utility functions from module

  // Contains identifiers for actions that should only be tracked
  // once per user session, as defined by the boolean value of
  // onlyFirstTime passed to eventTracking.track()
  // This is private
  var alreadyTracked = []

  // Public
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

  return {
    track: track
  }

}())
