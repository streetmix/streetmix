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

    ga && ga('send', 'event', category, action, label, value);

    if (onlyFirstTime) {
      _eventTracking.alreadyTracked[id] = true;
    }
  }
}
