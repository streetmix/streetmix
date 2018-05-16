/**
 * info_bubble/description
 *
 * Additional descriptive text about segments.
 */
import { getSegmentInfo, getSegmentVariantInfo } from '../segments/info'
import { infoBubble } from './info_bubble'

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
  infoBubble.el.classList.add('show-description')
  if (infoBubble.segmentEl) {
    infoBubble.segmentEl.classList.add('hide-drag-handles-when-description-shown')
  }

  infoBubble.updateHoverPolygon()
}

export function hideDescription () {
  infoBubble.el.classList.remove('show-description')
  if (infoBubble.segmentEl) {
    infoBubble.segmentEl.classList.remove('hide-drag-handles-when-description-shown')
  }

  infoBubble.updateHoverPolygon()
}
