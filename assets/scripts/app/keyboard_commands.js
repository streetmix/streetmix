import { registerKeypress } from './keypress'
import { showStatusMessage } from './status_message'
import { msg } from './messages'

registerKeypress('ctrl s', {
  trackMsg: 'Command-S or Ctrl-S save shortcut key pressed'
}, function () {
  showStatusMessage(msg('STATUS_NO_NEED_TO_SAVE'))
})
