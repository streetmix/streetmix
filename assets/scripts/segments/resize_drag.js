import { setIgnoreStreetChanges } from '../streets/data_model'
import { INFO_BUBBLE_TYPE_SEGMENT } from '../info_bubble/constants'
import { infoBubble } from '../info_bubble/info_bubble'
import {
  RESIZE_TYPE_INITIAL,
  RESIZE_TYPE_PRECISE_DRAGGING,
  resizeSegment,
  scheduleControlsFadeout,
  cancelFadeoutControls
} from './resizing'
import { segmentsChanged, getSegmentEl } from './view'
import { TILE_SIZE } from './constants'
import store from '../store'

let originalWidth

function getActiveSegmentWidth () {
  const activeSegment = store.getState().ui.activeSegment
  const segment = store.getState().street.segments[activeSegment]
  return segment.width
}

export function beginSegmentResize () {
  originalWidth = getActiveSegmentWidth()

  setIgnoreStreetChanges(true)
  document.body.classList.add('segment-resize-dragging')

  infoBubble.hide()
  cancelFadeoutControls()
}

export function duringSegmentResize (delta) {
  const previewWidth = originalWidth + (delta / TILE_SIZE * 2)
  const activeSegment = store.getState().ui.activeSegment

  // TODO: put back "precise" once we know how to get shift key.
  // const precise = event.shiftKey
  // let resizeType
  // if (precise) {
  //   resizeType = RESIZE_TYPE_PRECISE_DRAGGING
  // } else {
  //   resizeType = RESIZE_TYPE_DRAGGING
  // }
  const resizeType = RESIZE_TYPE_PRECISE_DRAGGING

  resizeSegment(activeSegment, resizeType, previewWidth)
}

export function endSegmentResize () {
  originalWidth = undefined
  const activeSegment = store.getState().ui.activeSegment

  setIgnoreStreetChanges(false)
  segmentsChanged()
  document.body.classList.remove('segment-resize-dragging')

  handleSegmentResizeEnd(activeSegment)
}

// TODO: This is no longer used anywhere (the keydown button that used to call this is no longer
// set), but we should consider making it possible to cancel resizing again.
export function cancelSegmentResize () {
  const activeSegment = store.getState().ui.activeSegment

  resizeSegment(activeSegment, RESIZE_TYPE_INITIAL, originalWidth, true, false)

  handleSegmentResizeEnd(activeSegment)
}

// TODO: use suppressMouseEnter on <StreetEditable /> state
let _suppressMouseEnter = false

export function suppressMouseEnter () {
  return _suppressMouseEnter
}

function handleSegmentResizeEnd (activeSegment) {
  const el = getSegmentEl(activeSegment)

  infoBubble.considerSegmentEl = el
  infoBubble.show(false)

  scheduleControlsFadeout()

  _suppressMouseEnter = true
  infoBubble.considerShowing(null, el, INFO_BUBBLE_TYPE_SEGMENT)
  window.setTimeout(function () {
    _suppressMouseEnter = false
  }, 50)
}
