import { combineReducers } from 'redux'
import debug from './debug'
import system from './system'

const reducers = combineReducers({
  debug,
  system
})

export default reducers
