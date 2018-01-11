/**
 * info_bubble/description
 *
 * Additional descriptive text about segments.
 */

import { getStreetSectionTop } from '../app/window_resize'
import { SEGMENT_INFO } from '../segments/info'
import { infoBubble } from './info_bubble'

export function getDescriptionData (segment) {
  if (!segment) return null

  const segmentInfo = SEGMENT_INFO[segment.type]
  const variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString]

  if (variantInfo && variantInfo.description) {
    return variantInfo.description
  } else if (segmentInfo && segmentInfo.description) {
    return segmentInfo.description
  } else {
    return null
  }
}

export function showDescription () {
  infoBubble.descriptionVisible = true

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
  infoBubble.descriptionVisible = false

  infoBubble.el.classList.remove('show-description')
  if (infoBubble.segmentEl) {
    infoBubble.segmentEl.classList.remove('hide-drag-handles-when-description-shown')
  }

  infoBubble.updateHoverPolygon()
}
