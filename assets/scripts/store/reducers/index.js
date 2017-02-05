import { combineReducers } from 'redux'
import app from './app'
import debug from './debug'
import system from './system'

const reducers = combineReducers({
  app,
  debug,
  system
})

export default reducers
