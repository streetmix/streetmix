import { API_URL } from '../app/config'
import { KEYS } from '../app/keyboard_commands'
import { system } from '../preinit/system_capabilities'
import { newNonblockingAjaxRequest } from '../util/fetch_nonblocking'
import { getSharingUrl } from '../util/share_url'
import Menu from './menu'

const LOCAL_STORAGE_FEEDBACK_BACKUP = 'feedback-backup'
const LOCAL_STORAGE_FEEDBACK_EMAIL_BACKUP = 'feedback-email-backup'
const TWITTER_ID = '@streetmix'

export let feedbackMenu = new Menu('feedback', {
  init: _addEventListeners,
  onShow: _prepareFeedbackForm
})

feedbackMenu.update = _updateFeedbackMenu

function _addEventListeners () {
  // document.querySelector('#feedback-form-message').addEventListener('input', _onFeedbackFormInput)
  // document.querySelector('#feedback-form-email').addEventListener('input', _onFeedbackFormInput)
  // document.querySelector('#feedback-form-email').addEventListener('keydown', _onFeedbackFormEmailKeyDown)
  // document.querySelector('#feedback-form-send').addEventListener('pointerdown', _feedbackFormSend)
}

function _isFeedbackFormMessagePresent () {
  var message = document.querySelector('#feedback-form-message').value.trim()
  return message.length > 0
}

function _updateFeedbackForm () {
  if (_isFeedbackFormMessagePresent()) {
    document.querySelector('#feedback-form-send').disabled = false
  } else {
    document.querySelector('#feedback-form-send').disabled = true
  }
}

function _onFeedbackFormEmailKeyDown (event) {
  if (event.keyCode === KEYS.ENTER) {
    _feedbackFormSend()
  }
}

function _feedbackFormSend () {
  if (_isFeedbackFormMessagePresent()) {
    document.querySelector('#feedback-form .loading').classList.add('visible')

    var additionalInformation = '\nUser agent: ' + navigator.userAgent
    if (system.ipAddress) {
      additionalInformation += '\nIP: ' + system.ipAddress
    }

    var transmission = {
      message: document.querySelector('#feedback-form-message').value,
      from: document.querySelector('#feedback-form-email').value,
      additionalInformation: additionalInformation
    }

    newNonblockingAjaxRequest({
      // TODO const
      url: API_URL + 'v1/feedback',
      data: JSON.stringify(transmission),
      dataType: 'json',
      type: 'POST',
      contentType: 'application/json'
    }, true, _feedbackFormSuccess, _feedbackFormError, 3)

  // ---------------------------------------------- ^^^
  // We are automatically halting the feedback form sending if it fails 3 times.
  // If we do not do this, then Streetmix will continue to re-attempt sending feedback
  // forever, while claiming that Streetmix is having trouble connecting to the Internet.
  // It is more likely that Sendgrid is having problems than the Internet connection itself
  // (e.g. the Sendgrid connection is bad, the credentials are bad, etc.)
  // So if Sendgrid is having problems, instead just inform the user that the
  // feedback could not be sent, and move on.
  }
}

function _feedbackFormSuccess () {
  document.querySelector('#feedback-form .loading').classList.remove('visible')
  document.querySelector('#feedback-form .thank-you').classList.add('visible')

  // TODO better remove
  window.localStorage[LOCAL_STORAGE_FEEDBACK_BACKUP] = ''
  window.localStorage[LOCAL_STORAGE_FEEDBACK_EMAIL_BACKUP] = ''

  // TODO const
  window.setTimeout(feedbackMenu.hide, 2500)
}

function _feedbackFormError () {
  document.querySelector('#feedback-form .loading').classList.remove('visible')
  document.querySelector('#feedback-form .error').classList.add('visible')

  // On error, do not clear the feedback storage. This allows a user
  // to try again later, or copy-paste the message to some other
  // contact method.

  window.setTimeout(feedbackMenu.hide, 10000)
}

function _onFeedbackFormInput () {
  window.localStorage[LOCAL_STORAGE_FEEDBACK_BACKUP] =
    document.querySelector('#feedback-form-message').value
  window.localStorage[LOCAL_STORAGE_FEEDBACK_EMAIL_BACKUP] =
    document.querySelector('#feedback-form-email').value

  _updateFeedbackForm()
}

function _updateFeedbackMenu () {
  const el = document.querySelector('#feedback-via-twitter')

  const text = TWITTER_ID
  const url = getSharingUrl()

  // TODO const
  el.href = 'https://twitter.com/intent/tweet' +
    '?text=' + encodeURIComponent(text) +
    '&url=' + encodeURIComponent(url)
}

function _prepareFeedbackForm (event) {
  // Event comes from the onShow handler on the menu
  return;
  if (event && event.pointerType === 'mouse') {
    window.setTimeout(function () {
      document.querySelector('#feedback-form-message').focus()
    }, 200)
  }

  var message = window.localStorage[LOCAL_STORAGE_FEEDBACK_BACKUP] || ''
  document.querySelector('#feedback-form-message').value = message

  var email = window.localStorage[LOCAL_STORAGE_FEEDBACK_EMAIL_BACKUP] || ''
  document.querySelector('#feedback-form-email').value = email

  _updateFeedbackForm()

  var notices = document.querySelectorAll('#feedback-form .feedback-notice')
  for (var i = 0; i < notices.length; i++) {
    notices[i].classList.remove('visible')
  }
}
