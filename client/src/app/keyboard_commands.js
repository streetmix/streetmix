import USER_ROLES from '../../../app/data/user_roles.json'
import { DRAGGING_TYPE_RESIZE, DRAGGING_TYPE_MOVE } from '../segments/constants'
import { handleSegmentResizeCancel } from '../segments/resizing'
import { getSignInData, isSignedIn } from '../users/authentication'
import { formatMessage } from '../locales/locale'
import { showDialog } from '../store/slices/dialogs'
import { addToast } from '../store/slices/toasts'
import { handleUndo, handleRedo } from '../store/actions/history'
import store from '../store'
import { registerKeypress } from './keypress'
import { ENV } from './config'

export function onGlobalKeyDown (event) {
  switch (event.key) {
    case 'Esc': // IE/Edge specific value
    case 'Escape': {
      const { draggingType } = store.getState().ui

      if (draggingType === DRAGGING_TYPE_RESIZE) {
        handleSegmentResizeCancel()
      } else if (draggingType === DRAGGING_TYPE_MOVE) {
        // We don't handle this here anymore
        // TODO: Double check on side effects of not handling this
        return
      } else {
        return
      }

      event.preventDefault()
      break
    }
  }
}

export function registerKeypresses () {
  // In case anyone tries a save shortcut key out of reflex,
  // we inform the user that it's not necessary.
  registerKeypress('ctrl s', function () {
    store.dispatch(
      addToast({
        message: formatMessage(
          'toast.no-save',
          'No need to save by hand; Streetmix automatically saves your street!'
        )
      })
    )
  })

  // Catch-all for the Ctrl-S shortcut from ever trying to
  // save the page contents
  registerKeypress(
    'ctrl s',
    {
      preventDefault: true,
      requireFocusOnBody: false
    },
    () => {} // noop
  )

  // Catch-all for the backspace or delete buttons to prevent
  // browsers from going back in history
  registerKeypress(
    ['backspace', 'delete'],
    {
      preventDefault: true,
      requireFocusOnBody: true
    },
    () => {} // noop
  )

  // Secret menu to toggle feature flags
  // Only active in development/staging
  registerKeypress('shift f', () => {
    if (
      ENV !== 'production' ||
      (isSignedIn() &&
        getSignInData().details.roles.includes(USER_ROLES.ADMIN.value))
    ) {
      store.dispatch(showDialog('FEATURE_FLAGS'))
    }
  })

  // Undo
  registerKeypress(
    'ctrl z',
    {
      preventDefault: true,
      requireFocusOnBody: true,
      shiftKey: false
    },
    () => {
      store.dispatch(handleUndo())
    }
  )

  // Redo
  registerKeypress(
    ['shift ctrl z', 'ctrl y'],
    {
      preventDefault: true,
      requireFocusOnBody: true
    },
    () => {
      store.dispatch(handleRedo())
    }
  )
}
