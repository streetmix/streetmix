import app from '../slices/app'
import debug from '../slices/debug'
import dialogs from '../slices/dialogs'
import errors from '../slices/errors'
import flags from '../slices/flags'
import gallery from '../slices/gallery'
import infoBubble from '../slices/infoBubble'
import locale from '../slices/locale'
import map from '../slices/map'
import menus from '../slices/menus'
import settings from '../slices/settings'
import persistSettings from '../slices/persistSettings'
import street from '../slices/street'
import system from '../slices/system'
import toasts from '../slices/toasts'
import ui from '../slices/ui'
import undo from '../slices/undo'
import user from '../slices/user'

const reducers = {
  app,
  debug,
  dialogs,
  errors,
  flags,
  gallery,
  infoBubble,
  locale,
  map,
  menus,
  settings,
  persistSettings,
  street,
  system,
  toasts,
  ui,
  undo,
  user
}

export default reducers
