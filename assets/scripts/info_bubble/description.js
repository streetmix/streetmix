/**
 * info_bubble/description
 *
 * Additional descriptive text about segments.
 */
import { getSegmentInfo, getSegmentVariantInfo } from '../segments/info'

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
