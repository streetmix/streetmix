import { getSegmentInfo, getSegmentVariantInfo } from '@streetmix/parts'

import { formatMessage } from '../locales/locale'
import store from '../store'
import { changeSegmentProperties } from '../store/slices/street'
import { getBoundaryItem } from '../boundary'
import { MAX_SEGMENT_LABEL_LENGTH } from './constants'
import { segmentsChanged } from './view'

import type {
  BoundaryPosition,
  SectionType,
  SliceItem,
  StreetJson,
} from '@streetmix/types'

/**
 * Process / sanitize segment labels
 *
 * @params name - Segment label to check
 * @returns normalized / sanitized segment label
 */
function normalizeSegmentLabel(label: string): string | undefined {
  label = label.trim()

  // If label is the empty string, return undefined
  if (label === '') {
    return undefined
  }

  // Trim a long label
  if (label.length > MAX_SEGMENT_LABEL_LENGTH) {
    label = label.substring(0, MAX_SEGMENT_LABEL_LENGTH) + '…'
  }

  return label
}

export function getLocaleSegmentName(
  type: string,
  variantString: string
): string {
  const segmentInfo = getSegmentInfo(type)
  const variantInfo = getSegmentVariantInfo(type, variantString)
  const defaultName = variantInfo.name ?? segmentInfo.name
  const nameKey = variantInfo.nameKey ?? segmentInfo.nameKey
  const key = `segments.${nameKey}`

  return formatMessage(key, defaultName, { ns: 'segment-info' })
}

/**
 * Uses browser prompt to change the segment label
 *
 * @param segment - object describing the segment to edit
 * @param position - index of segment to edit
 */
export function editSegmentLabel(position: number, slice: SliceItem) {
  const prevLabel =
    slice.label || getLocaleSegmentName(slice.type, slice.variantString)

  // If prompt returns empty string, set label to undefined. This resets the
  // label to the original default name
  // If prompt returns null (the prompt has been canceled), do not change the
  // label.
  const labelInput = window.prompt(
    formatMessage('prompt.segment-label', 'New segment label:'),
    prevLabel
  )

  if (labelInput === null) {
    return
  }

  const label = normalizeSegmentLabel(labelInput)

  if (label !== prevLabel) {
    store.dispatch(changeSegmentProperties(position, { label }))
    segmentsChanged()
  }
}

// A slice has a label: either a user-specified string, or the default one
// for a given slice type and variant. Default labels are translated into
// the user's preferred locale.
export function getLabel(
  street: StreetJson,
  type: SectionType,
  position: number | BoundaryPosition
) {
  let id
  let defaultMessage = ''

  switch (true) {
    case type === 'slice' && typeof position === 'number': {
      const slice = street.segments[position]

      if (slice === undefined) {
        break
      }

      // Return label if provided
      if (slice?.label !== undefined) {
        return slice.label
      } else {
        // Otherwise need to do a lookup
        const sliceInfo = getSegmentInfo(slice.type)
        const variantInfo = getSegmentVariantInfo(
          slice.type,
          slice.variantString
        )
        const key = variantInfo.nameKey ?? sliceInfo.nameKey

        id = `segments.${key}`
        defaultMessage = variantInfo.name ?? sliceInfo.name ?? ''
      }
      break
    }
    case type === 'boundary' && typeof position !== 'number': {
      const key = street.boundary[position].variant

      id = `buildings.${key}.name`
      defaultMessage = getBoundaryItem(key).label

      break
    }
    default:
      break
  }

  if (typeof id !== 'undefined') {
    return formatMessage(id, defaultMessage, { ns: 'segment-info' })
  } else {
    return ''
  }
}
