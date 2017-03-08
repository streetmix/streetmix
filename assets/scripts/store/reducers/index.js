import { combineReducers } from 'redux'
import app from './app'
import debug from './debug'
import dialogs from './dialogs'
import system from './system'

const reducers = combineReducers({
  app,
  debug,
  dialogs,
  system
})

export default reducers
