import { combineReducers } from 'redux'
import app from '../slices/app'
import debug from '../slices/debug'
import dialogs from '../slices/dialogs'
import errors from '../slices/errors'
import flags from '../slices/flags'
import gallery from './gallery'
import infoBubble from './infoBubble'
import locale from '../slices/locale'
import map from '../slices/map'
import menus from '../slices/menus'
import settings from './settings'
import persistSettings from '../slices/persistSettings'
import street from './street'
import system from './system'
import toasts from '../slices/toasts'
import ui from './ui'
import undo from './undo'
import user from '../slices/user'

const reducers = combineReducers({
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
})

export default reducers
