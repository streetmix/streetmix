import { getSegmentInfo, getSegmentVariantInfo } from '@streetmix/parts'

import { formatMessage } from '../locales/locale'
import store from '../store'
import { segmentsChanged } from '../store/actions/street.js'
import { changeSegmentProperties } from '../store/slices/street'
import { getBoundaryItem } from '../boundary'

import type {
  BoundaryPosition,
  SectionType,
  SliceItem,
  StreetJson,
} from '@streetmix/types'

const MAX_LABEL_LENGTH = 50

/**
 * Process / sanitize slice labels
 *
 * @param label - Slice label to normalize
 */
function normalizeSliceLabel(label: string): string | undefined {
  label = label.trim()

  // If label is the empty string, return undefined
  if (label === '') {
    return undefined
  }

  // Trim a long label
  if (label.length > MAX_LABEL_LENGTH) {
    label = label.substring(0, MAX_LABEL_LENGTH) + '…'
  }

  return label
}

/**
 * Gets the default slice name.
 *
 * If `variantString` is not provided, return its default generic name.
 * This calls `formatMessage`, which reads the locale from app state.
 */
export function getLocaleSliceName(
  type: string,
  variantString?: string
): string {
  const sliceInfo = getSegmentInfo(type)
  const variantInfo = variantString
    ? getSegmentVariantInfo(type, variantString)
    : {}
  const defaultName = variantInfo.name ?? sliceInfo.name
  const nameKey = variantInfo.nameKey ?? sliceInfo.nameKey
  const key = `segments.${nameKey}`

  return formatMessage(key, defaultName, { ns: 'segment-info' })
}

/**
 * Uses browser prompt to change the slice label
 */
export function editSliceLabel(position: number, slice: SliceItem) {
  const prevLabel =
    slice.label || getLocaleSliceName(slice.type, slice.variantString)

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

  const label = normalizeSliceLabel(labelInput)

  if (label !== prevLabel) {
    store.dispatch(changeSegmentProperties(position, { label }))
    store.dispatch(segmentsChanged())
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
  // If we have a slice
  if (type === 'slice' && typeof position === 'number') {
    const slice = street.segments[position]

    // Return label if provided
    if (slice.label !== undefined) {
      return slice.label
    } else {
      // Otherwise need to do a lookup
      return getLocaleSliceName(slice.type, slice.variantString)
    }
    // Otherwise, if we have a boundary
  } else if (type === 'boundary' && typeof position !== 'number') {
    const key = street.boundary[position].variant

    const id = `buildings.${key}.name`
    const defaultMessage = getBoundaryItem(key).label

    return formatMessage(id, defaultMessage, { ns: 'segment-info' })
  }

  // If we've fallen through for any reason, return empty string
  return ''
}
