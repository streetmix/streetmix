import { app } from '../preinit/app_settings'
import {
  DRAGGING_TYPE_NONE,
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION
} from '../segments/constants'
import { getElAbsolutePos } from '../util/helpers'
import store from '../store'
import { showInfoBubble, hideInfoBubble } from '../store/slices/infoBubble'
import { setActiveSegment } from '../store/slices/ui'
import {
  INFO_BUBBLE_TYPE_LEFT_BUILDING,
  INFO_BUBBLE_TYPE_RIGHT_BUILDING
} from './constants'

function isInfoBubbleVisible () {
  return store.getState().infoBubble.visible
}

export const infoBubble = {
  hoverPolygon: null,
  segmentEl: null,
  type: null,

  considerMouseX: null,
  considerMouseY: null,
  considerSegmentEl: null,
  considerType: null,

  suppressed: false,
  suppressTimerId: -1,

  /**
   * Suppressing the infobubble momentarily hides it (if shown) and delays
   * opening it again for some amount of time.
   */
  suppress: function () {
    if (!infoBubble.suppressed) {
      infoBubble.hide()
      infoBubble.hideSegment(true)
      infoBubble.suppressed = true
    }

    window.clearTimeout(infoBubble.suppressTimerId)
    infoBubble.suppressTimerId = window.setTimeout(infoBubble.unsuppress, 100)
  },

  unsuppress: function () {
    infoBubble.suppressed = false

    window.clearTimeout(infoBubble.suppressTimerId)
  },

  _withinHoverPolygon: function (x, y) {
    const hoverPolygon = store.getState().infoBubble.hoverPolygon
    return _isPointInPoly(hoverPolygon, [x, y])
  },

  hideSegment: function (fast) {
    if (infoBubble.segmentEl) {
      infoBubble.segmentEl.classList.remove('hover')
      store.dispatch(setActiveSegment(null))
      const el = infoBubble.segmentEl
      if (fast) {
        el.classList.add('immediate-show-drag-handles')
        window.setTimeout(function () {
          el.classList.remove('immediate-show-drag-handles')
        }, 0)
      } else {
        el.classList.remove('immediate-show-drag-handles')
      }
      infoBubble.segmentEl.classList.remove('show-drag-handles')
      infoBubble.segmentEl = null
    }
  },

  hide: function () {
    store.dispatch(hideInfoBubble())
  },

  /**
   * Determines whether to display the info bubble for a given segment.
   */
  considerShowing: function (event, segmentEl, type) {
    // Bail under UI conditions where we shouldn't show the info bubble
    if (Boolean(store.getState().menus) === true || app.readOnly) {
      return
    }

    // Bail if we are requesting the info bubble for the element already being displayed
    if (segmentEl === infoBubble.segmentEl && type === infoBubble.type) {
      return
    }

    if (event) {
      infoBubble.considerMouseX = event.pageX
      infoBubble.considerMouseY = event.pageY
    } else {
      const pos = getElAbsolutePos(segmentEl)

      infoBubble.considerMouseX =
        pos[0] - document.querySelector('#street-section-outer').scrollLeft
      infoBubble.considerMouseY = pos[1]
    }

    infoBubble.considerSegmentEl = segmentEl
    infoBubble.considerType = type

    if (
      !isInfoBubbleVisible() ||
      !infoBubble._withinHoverPolygon(
        infoBubble.considerMouseX,
        infoBubble.considerMouseY
      )
    ) {
      infoBubble.show()
    }
  },

  dontConsiderShowing: function () {
    infoBubble.considerSegmentEl = null
    infoBubble.considerType = null
  },

  // TODO rename
  show: function () {
    if (infoBubble.suppressed) {
      window.setTimeout(infoBubble.show, 100)
      return
    }

    if (store.getState().ui.draggingType !== DRAGGING_TYPE_NONE) {
      return
    }

    if (!infoBubble.considerType) {
      infoBubble.hide()
      infoBubble.hideSegment(false)
      return
    }

    const segmentEl = infoBubble.considerSegmentEl
    const type = infoBubble.considerType

    if (segmentEl === infoBubble.segmentEl && type === infoBubble.type) {
      return
    }
    infoBubble.hideSegment(true)

    infoBubble.segmentEl = segmentEl
    infoBubble.type = type

    if (
      type !== INFO_BUBBLE_TYPE_LEFT_BUILDING &&
      type !== INFO_BUBBLE_TYPE_RIGHT_BUILDING
    ) {
      if (segmentEl) {
        segmentEl.classList.add('hover')
        segmentEl.classList.add('show-drag-handles')
      }
      if (isInfoBubbleVisible()) {
        segmentEl.classList.add('immediate-show-drag-handles')
      }
    }

    let sliceIndex // starts either string or undefined
    if (segmentEl.dataset.sliceIndex === undefined) {
      sliceIndex =
        type === INFO_BUBBLE_TYPE_LEFT_BUILDING
          ? BUILDING_LEFT_POSITION
          : BUILDING_RIGHT_POSITION
    } else {
      // convert string to number
      sliceIndex = Number(segmentEl.dataset.sliceIndex)
    }
    store.dispatch(setActiveSegment(sliceIndex))

    store.dispatch(showInfoBubble())
  }
}

function _isPointInPoly (vs = [], point) {
  const x = point[0]
  const y = point[1]

  let inside = false
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0]
    const yi = vs[i][1]
    const xj = vs[j][0]
    const yj = vs[j][1]

    // prettier-ignore
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi) / (yj - yi)) + xi)

    if (intersect) inside = !inside
  }

  return inside
}
