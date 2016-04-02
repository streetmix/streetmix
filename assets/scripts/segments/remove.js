/* global street */
/* global _switchSegmentElAway, _createDomFromData, _segmentsChanged */
import { msg } from '../app/messages'
import { registerKeypress } from '../app/keypress'
import { showStatusMessage } from '../app/status_message'
import { infoBubble } from '../info_bubble/info_bubble'
import { getHoveredSegmentEl } from './hover'

/**
 * Removes a segment, given the element to remove
 *
 * @param {Node} the segment element to remove
 */
export function removeSegment (el) {
  if (!el && !el.parentNode) {
    return
  }

  infoBubble.hide()

  // This makes sure that the drag handles on the segment
  // don't appear briefly after animating away
  infoBubble.hideSegment()

  // Animates segment away
  _switchSegmentElAway(el)

  _segmentsChanged()
  showStatusMessage(msg('STATUS_SEGMENT_DELETED'), true)
}

/**
 * Removes all segments. This is a “power user” feature
 * and it is not advertised in the UI.
 */
export function removeAllSegments () {
  street.segments = []
  _createDomFromData()
  _segmentsChanged()
  infoBubble.hide()
  showStatusMessage(msg('STATUS_ALL_SEGMENTS_DELETED'), true)
}

// Register keyboard shortcuts for segment removal
registerKeypress(['backspace', 'delete'], {
  trackMsg: 'Remove segment', // TRACK_ACTION_REMOVE_SEGMENT
  // Prevent deletion from occurring of the description is visible
  condition: function () { return !infoBubble.descriptionVisible }
}, function () {
  let el = getHoveredSegmentEl()
  removeSegment(el)
})

// Power shortcut for removing ALL segments. This is not
// advertised anywhere in the UI.
registerKeypress(['shift backspace', 'shift delete'], {
  trackMsg: 'Remove all segments',
  // Prevent deletion from occurring of the description is visible
  // Also, we don't need to know which segment is being hovered,
  // but we should only execute this IF an segment is being hovered
  // This prevents this key command from executing anywhere
  condition: function () {
    return !infoBubble.descriptionVisible && getHoveredSegmentEl()
  }
}, function () {
  removeAllSegments()
})
