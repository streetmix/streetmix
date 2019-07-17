import { SET_FEATURE_FLAG, SET_FLAG_OVERRIDES } from './index'

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

export function setFlagOverrides (flags) {
  return {
    type: SET_FLAG_OVERRIDES,
    flags
  }
}
