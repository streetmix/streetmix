import React from 'react'
import { IntlProvider } from 'react-intl'

import { useSelector } from '~/src/store/hooks'
import {
  INFO_BUBBLE_TYPE_SEGMENT,
  INFO_BUBBLE_TYPE_LEFT_BUILDING,
  INFO_BUBBLE_TYPE_RIGHT_BUILDING
} from '../constants'
import Variants from './Variants'
import WidthControl from './WidthControl'
import BuildingHeightControl from './BuildingHeightControl'

import type { BoundaryPosition } from '@streetmix/types'

interface InfoBubbleControlsProps {
  type: number // Info bubble type
  position: number | BoundaryPosition
}

function InfoBubbleControls (
  props: InfoBubbleControlsProps
): React.ReactElement {
  const { type, position } = props
  const { locale, segmentInfo } = useSelector((state) => state.locale)

  // Determine width or height control type
  let widthOrHeightControl
  switch (type) {
    case INFO_BUBBLE_TYPE_SEGMENT:
      widthOrHeightControl = <WidthControl position={position} />
      break
    case INFO_BUBBLE_TYPE_LEFT_BUILDING:
    case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
      widthOrHeightControl = <BuildingHeightControl position={position} />
      break
    default:
      widthOrHeightControl = null
      break
  }

  return (
    <div className="info-bubble-controls">
      <IntlProvider locale={locale} messages={segmentInfo}>
        <Variants type={type} position={position} />
      </IntlProvider>
      {widthOrHeightControl}
    </div>
  )
}

export default InfoBubbleControls
