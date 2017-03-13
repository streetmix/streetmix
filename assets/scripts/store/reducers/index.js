import { combineReducers } from 'redux'
import app from './app'
import debug from './debug'
import dialogs from './dialogs'
import system from './system'
import settings from './settings'

const reducers = combineReducers({
  app,
  debug,
  dialogs,
  system,
  settings
})

export default reducers
