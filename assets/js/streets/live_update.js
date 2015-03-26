function _flash() {
  document.querySelector('#flash').classList.add('visible');

  window.setTimeout(function() {
    document.querySelector('#flash').classList.add('fading-out');
  }, 100);

  window.setTimeout(function() {
    document.querySelector('#flash').classList.remove('visible');
    document.querySelector('#flash').classList.remove('fading-out');
  }, 1000);
}

function _receiveLiveUpdateStreet(transmission) {
  window.setTimeout(function() {
    _unpackServerStreetData(transmission, null, null, false);
    _updateEverything(true);
  }, 1000);

  _flash();
}

function _receiveLiveUpdateCheck(data, textStatus, jqXHR) {
  var newUpdatedDate =
      Math.floor((new Date(jqXHR.getResponseHeader('last-modified')).getTime()) / 1000);
  var oldUpdatedDate =
      Math.floor((new Date(street.updatedAt).getTime()) / 1000);

  if (newUpdatedDate != oldUpdatedDate) {
    var url = _getFetchStreetUrl();
    $.ajax({
      url: url,
      dataType: 'json',
      type: 'GET'
    }).done(_receiveLiveUpdateStreet);
  }

  _scheduleNextLiveUpdateCheck();
}

function _checkForLiveUpdate() {
  var url = _getFetchStreetUrl();

  $.ajax({
    url: url,
    dataType: 'json',
    type: 'HEAD'
  }).done(_receiveLiveUpdateCheck);
}

function _scheduleNextLiveUpdateCheck() {
  window.setTimeout(_checkForLiveUpdate, LIVE_UPDATE_DELAY);
}
