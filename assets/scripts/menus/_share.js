/* global signedIn, street, signInData */
/* global FACEBOOK_APP_ID */
import Menu from './menu'
import { trackEvent } from '../app/event_tracking'
import { getPageTitle } from '../app/page_title'
import { getSharingUrl } from '../util/share_url'

export let shareMenu = new Menu('share', {
  alignment: 'right',
  onInit: function () {
    document.querySelector('#share-via-twitter').addEventListener('pointerdown', _shareViaTwitter)
    document.querySelector('#share-via-facebook').addEventListener('pointerdown', _shareViaFacebook)
  },
  onShow: function () {
    // Auto-focus and select link when share menu is active
    var el = document.querySelector('#share-via-link')
    window.setTimeout(function () {
      el.focus()
      el.select()
    }, 200)
  }
})

shareMenu.update = _updateShareMenu

function _shareViaTwitter () {
  trackEvent('SHARING', 'TWITTER', null, null, false)
}

function _shareViaFacebook () {
  trackEvent('SHARING', 'FACEBOOK', null, null, false)
}

function _getSharingMessage () {
  let message = ''

  if (street.creatorId) {
    if (signedIn && street.creatorId === signInData.userId) {
      message = `Check out my street, ${street.name}, on Streetmix!`
    } else {
      message = `Check out ${street.name} by @${street.creatorId} on Streetmix!`
    }
  } else {
    message = `Check out ${street.name} on Streetmix!`
  }

  return message
}

function _updateFacebookLink (url) {
  const el = document.querySelector('#share-via-facebook')
  const text = _getSharingMessage()
  const appId = FACEBOOK_APP_ID

  el.href = 'https://www.facebook.com/dialog/feed' +
    '?app_id=' + encodeURIComponent(appId) +
    '&redirect_uri=' + encodeURIComponent(url) +
    '&link=' + encodeURIComponent(url) +
    '&name=' + encodeURIComponent(getPageTitle()) +
    '&description=' + encodeURIComponent(text)
}

function _updateTwitterLink (url) {
  const el = document.querySelector('#share-via-twitter')
  const text = _getSharingMessage()

  el.href = 'https://twitter.com/intent/tweet' +
    '?text=' + encodeURIComponent(text) +
    '&url=' + encodeURIComponent(url)
}

function _updateNakedLink (url) {
  document.querySelector('#share-via-link').value = url
}

function _updateShareMenu () {
  var url = getSharingUrl()

  _updateNakedLink(url)
  _updateTwitterLink(url)
  _updateFacebookLink(url)

  if (!signedIn) {
    document.querySelector('#sign-in-promo').classList.add('visible')
  }
}
