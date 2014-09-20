var TRACK_CATEGORY_INTERACTION = 'Interaction';
var TRACK_CATEGORY_EVENT = 'Event';
var TRACK_CATEGORY_ERROR = 'Error';
var TRACK_CATEGORY_SYSTEM = 'System';

var _eventTracking = {
  alreadyTracked: [],

  track: function(category, action, label, value, onlyFirstTime) {
    if (onlyFirstTime) {
      var id = category + '|' + action + '|' + label;

      if (_eventTracking.alreadyTracked[id]) {
        return;
      }
    }

    // console.log('Event tracked', category, action, label);

    if (typeof ga != 'undefined') {
      ga('send', 'event', category, action, label, value);
    }

    if (onlyFirstTime) {
      _eventTracking.alreadyTracked[id] = true;
    }
  }
}
