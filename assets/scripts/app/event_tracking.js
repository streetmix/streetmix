/* global ga */
// Contains identifiers for actions that should only be tracked
// once per user session, as defined by the boolean value of
// onlyFirstTime passed to eventTracking.track()
let alreadyTracked = []

// These constants define what are valid categories for Streetmix
// const TRACK_CATEGORY_INTERACTION = 'Interaction'
// const TRACK_CATEGORY_EVENT = 'Event'
// const TRACK_CATEGORY_ERROR = 'Error'
// const TRACK_CATEGORY_SYSTEM = 'System'
// const TRACK_CATEGORY_SHARING = 'Sharing'

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

  // If this should only be tracked once, do this
  if (onlyFirstTime) {
    var id = category + '|' + action + '|' + label

    // If it has already tracked, exit this function
    if (alreadyTracked[id]) {
      return
    } else {
      // Otherwise, record a signature of this event for later checking
      alreadyTracked[id] = true
    }
  }

  // Send the event to Google Analytics
  ga && ga('send', 'event', category, action, label, value)
}
