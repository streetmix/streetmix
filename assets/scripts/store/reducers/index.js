import { combineReducers } from 'redux'
import app from './app'
import debug from './debug'
import dialogs from './dialogs'
import system from './system'
import user from './user'

const reducers = combineReducers({
  app,
  debug,
  dialogs,
  system,
  user
})

export default reducers
