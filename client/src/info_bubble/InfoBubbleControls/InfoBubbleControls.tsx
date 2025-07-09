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
import ElevationControl from './ElevationControl'
import './InfoBubbleControls.css'

import type { SectionType, BoundaryPosition } from '@streetmix/types'

interface InfoBubbleControlsProps {
  type: number | SectionType // number is deprecated
  position: number | BoundaryPosition
}

function InfoBubbleControls (
  props: InfoBubbleControlsProps
): React.ReactElement {
  const { type, position } = props
  const { locale, segmentInfo } = useSelector((state) => state.locale)
  const coastmixMode = useSelector((state) => state.flags.COASTMIX_MODE.value)

  // Determine width or height control type
  let widthOrHeightControl
  switch (type) {
    case 'slice':
    case INFO_BUBBLE_TYPE_SEGMENT:
      widthOrHeightControl = <WidthControl position={position} />
      break
    case 'boundary':
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
      <div className="info-bubble-control-group">
        <div className="info-bubble-control-row">
          <IntlProvider locale={locale} messages={segmentInfo}>
            <Variants type={type} position={position} />
          </IntlProvider>
          {widthOrHeightControl}
        </div>
      </div>
      {/* Only enabled for segments right now or Coastmix mode */}
      {(coastmixMode || typeof position === 'number') && (
        <div className="info-bubble-control-group">
          <ElevationControl position={position} />
        </div>
      )}
    </div>
  )
}

export default InfoBubbleControls
