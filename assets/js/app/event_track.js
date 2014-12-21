var TRACK_CATEGORY_INTERACTION = 'Interaction';
var TRACK_CATEGORY_EVENT = 'Event';
var TRACK_CATEGORY_ERROR = 'Error';
var TRACK_CATEGORY_SYSTEM = 'System';

var Stmx = (function (Stmx) {
  'use strict';

  // Contains identifiers for actions that should only be tracked
  // once per user session, as defined by the boolean value of
  // onlyFirstTime passed to eventTracking.track()
  // This is private
  var alreadyTracked = [];

  // Public
  Stmx.app.eventTracking = {
    track: function (category, action, label, value, onlyFirstTime) {
      if (onlyFirstTime) {
        var id = category + '|' + action + '|' + label;

        if (alreadyTracked[id]) {
          return;
        }
      }

      // console.log('Event tracked', category, action, label);

      ga && ga('send', 'event', category, action, label, value);

      if (onlyFirstTime) {
        alreadyTracked[id] = true;
      }
    }
  }

  return Stmx;

}(Stmx));
