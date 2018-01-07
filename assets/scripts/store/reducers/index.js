import { combineReducers } from 'redux'
import app from './app'
import debug from './debug'
import dialogs from './dialogs'
import gallery from './gallery'
import infoBubble from './infoBubble'
import map from './map'
import menus from './menus'
import settings from './settings'
import persistSettings from './persistSettings'
import status from './status'
import street from './street'
import system from './system'
import user from './user'

const reducers = combineReducers({
  app,
  debug,
  dialogs,
  gallery,
  infoBubble,
  map,
  menus,
  settings,
  persistSettings,
  status,
  street,
  system,
  user
})

export default reducers
