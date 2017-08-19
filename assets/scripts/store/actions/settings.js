import { SET_USER_SETTINGS } from './index'

export function setUserUnits (value) {
  return {
    type: SET_USER_SETTINGS,
    units: value
  }
}
