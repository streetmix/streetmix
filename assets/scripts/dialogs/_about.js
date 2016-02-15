/**
 * About Streetmix (dialog box)
 *
 * Handles the "About" dialog box.
 * Instantiates an instance of Dialog
 * Exports nothing
 *
 */
/* global EventTracking */
/* global URL_HELP_ABOUT, TRACK_CATEGORY_INTERACTION */
/* global _fetchAvatars, _updatePageUrl */
'use strict'

var Dialog = require('./dialog')

module.exports = new Dialog('#about', {
  clickSelector: '#about-streetmix',
  onShow: function () {
    var els = document.querySelectorAll('#about .avatar')
    for (var i = 0, j = els.length; i < j; i++) {
      els[i].removeAttribute('postpone')
    }

    window.history.replaceState(null, null, URL_HELP_ABOUT)

    // Tracking
    EventTracking.track(TRACK_CATEGORY_INTERACTION, 'Open about dialog box', null, null, false)

    _fetchAvatars()
  },
  onHide: function () {
    _updatePageUrl()
  }
})
