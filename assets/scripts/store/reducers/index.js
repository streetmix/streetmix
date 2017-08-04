import { combineReducers } from 'redux'
import app from './app'
import debug from './debug'
import dialogs from './dialogs'
import map from './map'
import menus from './menus'
import settings from './settings'
import status from './status'
import system from './system'
import user from './user'

const reducers = combineReducers({
  app,
  debug,
  dialogs,
  map,
  menus,
  settings,
  status,
  system,
  user
})

export default reducers
