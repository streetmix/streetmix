import React from 'react'
import { IntlProvider, FormattedMessage } from 'react-intl'

import { useSelector } from '~/src/store/hooks'
import { BUILDINGS } from '~/src/segments/buildings'
import { getSegmentInfo, getSegmentVariantInfo } from '~/src/segments/info'

import {
  INFO_BUBBLE_TYPE_LEFT_BUILDING,
  INFO_BUBBLE_TYPE_RIGHT_BUILDING,
  INFO_BUBBLE_TYPE_SEGMENT
} from '../constants'
import EditableLabel from './EditableLabel'
import RemoveButton from './RemoveButton'

import type { BuildingPosition, Segment, StreetState } from '@streetmix/types'

interface InfoBubbleHeaderProps {
  type: number
  position: number | BuildingPosition
  segment: Segment
  street: StreetState
}

function InfoBubbleHeader (props: InfoBubbleHeaderProps): React.ReactElement {
  const { type, position, segment, street } = props
  const { locale, segmentInfo } = useSelector((state) => state.locale)

  /**
   * Retrieve name from segment data. It should also find the equivalent strings from the
   * translation files if provided.
   */
  function getLabel (): React.ReactElement | string {
    let id
    let defaultMessage = ''

    // Return label if provided
    if (type === INFO_BUBBLE_TYPE_SEGMENT) {
      const segment = street.segments[position]
      if (segment?.label !== undefined) {
        return segment.label
      }
    }

    // Otherwise need to do a lookup
    switch (type) {
      case INFO_BUBBLE_TYPE_SEGMENT: {
        const segment = street.segments[position]
        if (segment !== undefined) {
          const segmentInfo = getSegmentInfo(segment.type)
          const variantInfo = getSegmentVariantInfo(
            segment.type,
            segment.variantString
          )
          const key = variantInfo.nameKey ?? segmentInfo.nameKey

          id = `segments.${key}`
          defaultMessage = variantInfo.name ?? segmentInfo.name
        }
        break
      }
      case INFO_BUBBLE_TYPE_LEFT_BUILDING: {
        const key = street.leftBuildingVariant

        id = `buildings.${key}.name`
        defaultMessage = BUILDINGS[key as keyof typeof BUILDINGS].label

        break
      }
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING: {
        const key = street.rightBuildingVariant

        id = `buildings.${key}.name`
        defaultMessage = BUILDINGS[key as keyof typeof BUILDINGS].label

        break
      }
      default:
        break
    }

    return id !== undefined
      ? (
        <IntlProvider locale={locale} messages={segmentInfo}>
          <FormattedMessage id={id} defaultMessage={defaultMessage} />
        </IntlProvider>
        )
      : (
          ''
        )
  }

  return (
    <header>
      <EditableLabel label={getLabel()} segment={segment} position={position} />
      {typeof position === 'number' && <RemoveButton segment={position} />}
    </header>
  )
}

export default InfoBubbleHeader
