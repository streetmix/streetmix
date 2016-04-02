import { registerKeypress } from './keypress'
import { showStatusMessage } from './status_message'
import { msg } from './messages'
import _ from 'lodash'

// In case anyone tries a save shortcut key out of reflex,
// we inform the user that it's not necessary.
registerKeypress('ctrl s', {
  trackMsg: 'Command-S or Ctrl-S save shortcut key pressed'
}, function () {
  showStatusMessage(msg('STATUS_NO_NEED_TO_SAVE'))
})

// Catch-all for the Ctrl-S shortcut from ever trying to
// save the page contents
registerKeypress('ctrl s', {
  preventDefault: true,
  requireFocusOnBody: false
}, _.noop)

// Catch-all for the backspace or delete buttons to prevent
// browsers from going back in history
registerKeypress(['backspace', 'delete'], {
  preventDefault: true,
  requireFocusOnBody: true
}, _.noop)
