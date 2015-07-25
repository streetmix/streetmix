var TRACK_ACTION_REMOVE_SEGMENT = 'Remove segment'
var TRACK_LABEL_BUTTON = 'Button'

function _removeSegment (el, all) {
  if (all) {
    street.segments = []
    _createDomFromData()
    _segmentsChanged()

    _infoBubble.hide()

    _statusMessage.show(msg('STATUS_ALL_SEGMENTS_DELETED'), true)
  } else if (el && el.parentNode) {
    _infoBubble.hide()
    _infoBubble.hideSegment()
    _switchSegmentElAway(el)
    _segmentsChanged()

    _statusMessage.show(msg('STATUS_SEGMENT_DELETED'), true)
  }
}

function _onRemoveButtonClick (event) {
  var el = event.target.segmentEl

  if (el) {
    _removeSegment(el, event.shiftKey)

    EventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_REMOVE_SEGMENT,
      TRACK_LABEL_BUTTON, null, true)
  }

  // Prevent this “leaking” to a segment below
  event.preventDefault()
}
