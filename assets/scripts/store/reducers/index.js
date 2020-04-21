import { combineReducers } from 'redux'
import app from './app'
import debug from '../slices/debug'
import dialogs from '../slices/dialogs'
import errors from './errors'
import flags from './flags'
import gallery from './gallery'
import infoBubble from './infoBubble'
import locale from './locale'
import map from './map'
import menus from './menus'
import settings from './settings'
import persistSettings from './persistSettings'
import street from './street'
import system from './system'
import toasts from '../slices/toasts'
import ui from './ui'
import undo from './undo'
import user from './user'

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
