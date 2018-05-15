/**
 * info_bubble/description
 *
 * Additional descriptive text about segments.
 */

import { getStreetSectionTop } from '../app/window_resize'
import { getSegmentInfo, getSegmentVariantInfo } from '../segments/info'
import { infoBubble } from './info_bubble'
import store from '../store'
import { showDescription as showDescriptionAction, hideDescription as hideDescriptionAction } from '../store/actions/infoBubble'

export function getDescriptionData (segment) {
  if (!segment) return null

  const segmentInfo = getSegmentInfo(segment.type)
  const variantInfo = getSegmentVariantInfo(segment.type, segment.variantString)

  if (variantInfo && variantInfo.description) {
    return variantInfo.description
  } else if (segmentInfo && segmentInfo.description) {
    return segmentInfo.description
  } else {
    return null
  }
}

export function showDescription () {
  store.dispatch(showDescriptionAction())

  const el = infoBubble.el.querySelector('.description-canvas')
  // TODO document magic numbers
  el.style.height = (getStreetSectionTop() + 300 - infoBubble.bubbleY) + 'px'

  infoBubble.el.classList.add('show-description')
  if (infoBubble.segmentEl) {
    infoBubble.segmentEl.classList.add('hide-drag-handles-when-description-shown')
  }

  infoBubble.updateHoverPolygon()
}

export function hideDescription () {
  store.dispatch(hideDescriptionAction())

  infoBubble.el.classList.remove('show-description')
  if (infoBubble.segmentEl) {
    infoBubble.segmentEl.classList.remove('hide-drag-handles-when-description-shown')
  }

  infoBubble.updateHoverPolygon()
}
