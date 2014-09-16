function _isFeedbackFormMessagePresent() {
  var message = document.querySelector('#feedback-form-message').value;
  message = $.trim(message);

  return message.length > 0;
}

function _updateFeedbackForm() {
  if (_isFeedbackFormMessagePresent()) {
    document.querySelector('#feedback-form-send').disabled = false;
  } else {
    document.querySelector('#feedback-form-send').disabled = true;
  }
}

function _onFeedbackFormEmailKeyDown(event) {
  if (event.keyCode == KEYS.ENTER) {
    _feedbackFormSend();
  }
}

function _feedbackFormSend() {
  if (_isFeedbackFormMessagePresent()) {

    document.querySelector('#feedback-form .loading').classList.add('visible');

    var additionalInformation = '\nUser agent: ' + navigator.userAgent;
    if (system.ipAddress) {
      additionalInformation += '\nIP: ' + system.ipAddress;
    }

    var transmission = {
      message: document.querySelector('#feedback-form-message').value,
      from: document.querySelector('#feedback-form-email').value,
      additionalInformation: additionalInformation
    };

    _newNonblockingAjaxRequest({
      // TODO const
      url: API_URL + 'v1/feedback',
      data: JSON.stringify(transmission),
      dataType: 'json',
      type: 'POST',
      contentType: 'application/json'
    }, true, _feedbackFormSuccess);
  }
}

function _feedbackFormSuccess() {
  document.querySelector('#feedback-form .loading').classList.remove('visible');
  document.querySelector('#feedback-form .thank-you').classList.add('visible');

  // TODO better remove
  window.localStorage[LOCAL_STORAGE_FEEDBACK_BACKUP] = '';
  window.localStorage[LOCAL_STORAGE_FEEDBACK_EMAIL_BACKUP] = '';

  // TODO const
  window.setTimeout(_hideMenus, 2500);
}

function _onFeedbackFormInput() {
  window.localStorage[LOCAL_STORAGE_FEEDBACK_BACKUP] =
      document.querySelector('#feedback-form-message').value;
  window.localStorage[LOCAL_STORAGE_FEEDBACK_EMAIL_BACKUP] =
      document.querySelector('#feedback-form-email').value;

  _updateFeedbackForm();
}

function _onFeedbackMenuClick() {
  var el = document.querySelector('#feedback-menu');

  _infoBubble.hide();
  _statusMessage.hide();

  if (!el.classList.contains('visible')) {
    _hideMenus();
    menuVisible = true;

    el.classList.add('visible');

    _prepareFeedbackForm();
  } else {
    _hideMenus();
  }
}

function _updateFeedbackMenu() {
  var el = document.querySelector('#feedback-via-twitter');

  var text = TWITTER_ID;
  var url = _getSharingUrl();

  // TODO const
  el.href = 'https://twitter.com/intent/tweet' +
      '?text=' + encodeURIComponent(text) +
      '&url=' + encodeURIComponent(url);
}

function _prepareFeedbackForm() {
  if (!system.touch) {
    window.setTimeout(function() {
      document.querySelector('#feedback-form-message').focus();
    }, 200);
  }

  var message = window.localStorage[LOCAL_STORAGE_FEEDBACK_BACKUP] || '';
  document.querySelector('#feedback-form-message').value = message;

  var email = window.localStorage[LOCAL_STORAGE_FEEDBACK_EMAIL_BACKUP] || '';
  document.querySelector('#feedback-form-email').value = email;

  _updateFeedbackForm();

  document.querySelector('#feedback-form .loading').classList.remove('visible');
  document.querySelector('#feedback-form .thank-you').classList.remove('visible');
}
