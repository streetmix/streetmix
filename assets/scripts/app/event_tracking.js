/* global ga */
// Contains identifiers for actions that should only be tracked
// once per user session, as defined by the boolean value of
// onlyFirstTime passed to eventTracking.track()
const alreadyTracked = []

// These constants define what are valid actions, labels and categories for Streetmix.
// They're stored as strings so that they can be passed around instead of needing to
// be stored as global variables or have to be exported from different sources.
// passed as variables, which would need to be global (and harder to manage).
// For a similar system see the Redux state store which similarly uses strings-as-
// constants to define action types.
// Strings are not namespaced to keep trackEvent() calls shorter.
const TRACK_CATEGORY = {
  INTERACTION: 'Interaction',
  EVENT: 'Event',
  ERROR: 'Error',
  SYSTEM: 'System',
  SHARING: 'Sharing'
}

const TRACK_ACTION = {
  TOUCH_CAPABLE: 'Touch capability detected',
  OPEN_GALLERY: 'Open gallery',
  UNDO: 'Undo',
  CHANGE_WIDTH: 'Change width',
  REMOVE_SEGMENT: 'Remove segment',
  LEARN_MORE: 'Learn more about segment',
  FACEBOOK: 'Facebook',
  TWITTER: 'Twitter',
  ERROR_15A: 'Error 15A (sign in API failure)',
  ERROR_RM1: 'Error RM1 (auth 401 failure on load)',
  ERROR_RM2: 'Error RM2 (auth 401 failure mid-flight)',
  ERROR_GEOLOCATION_TIMEOUT: 'Geolocation timeout',
  STREET_MODIFIED_ELSEWHERE: 'Street modified elsewhere'
}

const TRACK_LABEL = {
  BUTTON: 'Button',
  DRAGGING: 'Dragging',
  INPUT_FIELD: 'Input field',
  INCREMENT_BUTTON: 'Increment button',
  KEYBOARD: 'Keyboard'
}

/**
 * Tracks an event to Google Analytics
 * @param {string} category - Category to file under, see above for
 *        allowed category names
 * @param {string} action - The action to log
 * @param {string} label - The label (optional)
 * @param {string} value - The value (optional)
 * @param {boolean} onlyFirstTime - Only track this once
 */
export function trackEvent (category, action, label, value, onlyFirstTime) {
  // Return early if ga is not present, e.g. if tracking is blocked by user
  if (typeof ga === 'undefined') {
    return
  }

  const trackCategory = TRACK_CATEGORY[category] || category
  const trackAction = TRACK_ACTION[action] || action
  const trackLabel = TRACK_LABEL[label] || label

  // If this should only be tracked once, do this
  if (onlyFirstTime) {
    const id = trackCategory + '|' + trackAction + '|' + trackLabel

    // If it has already tracked, exit this function
    if (alreadyTracked[id]) {
      return
    } else {
      // Otherwise, record a signature of this event for later checking
      alreadyTracked[id] = true
    }
  }

  // Send the event to Google Analytics
  ga && ga('send', 'event', trackCategory, trackAction, trackLabel, value)
}
