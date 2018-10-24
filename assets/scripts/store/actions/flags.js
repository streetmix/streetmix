import { SET_FEATURE_FLAG, SET_USER_FLAGS } from './index'

/**
 * Sets a feature flag to a value. Not a toggle.
 *
 * @param {string} flag - name of flag
 * @param {Boolean} value - value to set flag to
 */
export function setFeatureFlag (flag, value) {
  return {
    type: SET_FEATURE_FLAG,
    flag,
    value
  }
}

export function setUserFlags (userFlags) {
  return {
    type: SET_USER_FLAGS,
    userFlags
  }
}
