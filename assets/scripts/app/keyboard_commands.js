import { noop } from 'lodash'

import USER_ROLES from '../../../app/data/user_roles'
import { KEYS } from './keys'
import { ENV } from './config'
import { registerKeypress } from './keypress'
import { DRAGGING_TYPE_RESIZE, DRAGGING_TYPE_MOVE } from '../segments/constants'
import { handleSegmentMoveCancel } from '../segments/drag_and_drop'
import { handleSegmentResizeCancel } from '../segments/resizing'
import { getSignInData, isSignedIn } from '../users/authentication'
import { showStatusMessage } from './status_message'
import { t } from '../locales/locale'
import { showDialog } from '../store/actions/dialogs'
import { undo, redo } from '../store/actions/undo'
import store from '../store'

export function onGlobalKeyDown (event) {
  const { draggingType } = store.getState().ui

  switch (event.keyCode) {
    case KEYS.ESC:
      if (draggingType === DRAGGING_TYPE_RESIZE) {
        handleSegmentResizeCancel()
      } else if (draggingType === DRAGGING_TYPE_MOVE) {
        handleSegmentMoveCancel()
      } else {
        return
      }

      event.preventDefault()
      break
  }
}

export function registerKeypresses () {
  // In case anyone tries a save shortcut key out of reflex,
  // we inform the user that it's not necessary.
  registerKeypress('ctrl s', {
    trackAction: 'Command-S or Ctrl-S save shortcut key pressed'
  }, function () {
    showStatusMessage(t('toast.no-save', 'No need to save by hand; Streetmix automatically saves your street!'))
  })

  // Catch-all for the Ctrl-S shortcut from ever trying to
  // save the page contents
  registerKeypress('ctrl s', {
    preventDefault: true,
    requireFocusOnBody: false
  }, noop)

  // Catch-all for the backspace or delete buttons to prevent
  // browsers from going back in history
  registerKeypress(['backspace', 'delete'], {
    preventDefault: true,
    requireFocusOnBody: true
  }, noop)

  // Secret menu to toggle feature flags
  // Only active in development/staging
  registerKeypress('shift f', () => {
    if (ENV !== 'production' || (isSignedIn() && getSignInData().details.roles.includes(USER_ROLES.ADMIN))) {
      store.dispatch(showDialog('FEATURE_FLAGS'))
    }
  })

  // Undo
  registerKeypress('ctrl z', {
    preventDefault: true,
    requireFocusOnBody: true,
    shiftKey: false
  }, () => {
    store.dispatch(undo())
  })

  // Redo
  registerKeypress(['shift ctrl z', 'ctrl y'], {
    preventDefault: true,
    requireFocusOnBody: true
  }, () => {
    store.dispatch(redo())
  })
}
