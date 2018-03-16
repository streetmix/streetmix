import { combineReducers } from 'redux'
import app from './app'
import debug from './debug'
import dialogs from './dialogs'
import errors from './errors'
import flags from './flags'
import gallery from './gallery'
import infoBubble from './infoBubble'
import locale from './locale'
import map from './map'
import menus from './menus'
import settings from './settings'
import persistSettings from './persistSettings'
import status from './status'
import street from './street'
import system from './system'
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
  status,
  street,
  system,
  ui,
  undo,
  user
})

export default reducers
