/**
 * About Streetmix (dialog box)
 *
 * Handles the "About" dialog box.
 * Instantiates an instance of Dialog
 * Exports nothing
 *
 */
/* global URL_HELP_ABOUT */
/* global _updatePageUrl */
var Dialog = require('./dialog')
var avatars = require('../users/avatars')
import { trackEvent } from '../app/event_tracking'

module.exports = new Dialog('#about', {
  clickSelector: '#about-streetmix',
  onShow: function () {
    var els = document.querySelectorAll('#about .avatar')
    for (var i = 0, j = els.length; i < j; i++) {
      els[i].removeAttribute('postpone')
    }

    window.history.replaceState(null, null, URL_HELP_ABOUT)

    // Tracking
    trackEvent('Interaction', 'Open about dialog box', null, null, false)

    avatars.fetch()
  },
  onHide: function () {
    _updatePageUrl()
  }
})
