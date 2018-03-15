import { SET_USER_UNITS } from './index'

export function setUserUnits (units) {
  return {
    type: SET_USER_UNITS,
    units: Number.parseInt(units, 10)
  }
}
