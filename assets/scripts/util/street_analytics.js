import { getSegmentVariantInfo, getSegmentInfo } from '../segments/info'

// take in a street and returns a list of segments with analytics info
const getAnalyticsFromStreet = (street) => {
  const segments = street.segments.map(segment => {
    const variant = (getSegmentVariantInfo(segment.type, segment.variantString) || {}).analytics
    const type = (getSegmentInfo(segment.type) || {}).analytics
    return { variant, type }
  })
  return { segments, street }
}

export default getAnalyticsFromStreet
