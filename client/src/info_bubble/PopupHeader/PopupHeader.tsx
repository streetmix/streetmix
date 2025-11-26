import React from 'react'
import { IntlProvider, FormattedMessage } from 'react-intl'
import { getSegmentInfo, getSegmentVariantInfo } from '@streetmix/parts'

import { useSelector } from '~/src/store/hooks'
import { getBoundaryItem } from '~/src/boundary'

import { EditableLabel } from './EditableLabel'
import { RemoveButton } from './RemoveButton'
import './PopupHeader.css'

import type { Segment, SectionElementTypeAndPosition } from '@streetmix/types'

export function PopupHeader(props: SectionElementTypeAndPosition) {
  const { type, position } = props
  const { locale, segmentInfo } = useSelector((state) => state.locale)
  const street = useSelector((state) => state.street)

  // Segment is undefined when position refers to a building
  let segment: Segment | undefined
  if (type === 'slice') {
    segment = street.segments[position]
  }

  /**
   * Retrieve name from segment data. It should also find the equivalent strings from the
   * translation files if provided.
   */
  function getLabel() {
    let id
    let defaultMessage = ''

    switch (type) {
      case 'slice': {
        if (segment === undefined) {
          break
        }

        // Return label if provided
        if (segment?.label !== undefined) {
          return segment.label
        } else {
          // Otherwise need to do a lookup
          const segmentInfo = getSegmentInfo(segment.type)
          const variantInfo = getSegmentVariantInfo(
            segment.type,
            segment.variantString
          )
          const key = variantInfo.nameKey ?? segmentInfo.nameKey

          id = `segments.${key}`
          defaultMessage = variantInfo.name ?? segmentInfo.name ?? ''
        }
        break
      }
      case 'boundary': {
        const key = street.boundary[position].variant

        id = `buildings.${key}.name`
        defaultMessage = getBoundaryItem(key).label

        break
      }
      default:
        break
    }

    return id !== undefined ? (
      <IntlProvider locale={locale} messages={segmentInfo}>
        <FormattedMessage id={id} defaultMessage={defaultMessage} />
      </IntlProvider>
    ) : (
      ''
    )
  }

  return (
    <header>
      <EditableLabel label={getLabel()} segment={segment} position={position} />
      {type === 'slice' && <RemoveButton segment={position} />}
    </header>
  )
}
