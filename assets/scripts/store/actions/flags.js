import { SET_FEATURE_FLAG } from './index'

/**
 * Sets a feature flag to a value. Not a toggle.
 *
 * @param {string} flag - name of flag
 * @param {Boolean} value - value to set flag to
 */
export function setFeatureFlag (flag, value, source) {
  return {
    type: SET_FEATURE_FLAG,
    flag,
    value,
    source
  }
}
