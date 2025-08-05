import React from 'react'
import { IntlProvider } from 'react-intl'

import { useSelector } from '~/src/store/hooks'
import Variants from './Variants'
import WidthControl from './WidthControl'
import BuildingHeightControl from './BuildingHeightControl'
import ElevationControl from './ElevationControl'
import './InfoBubbleControls.css'

import type { SectionElementTypeAndPosition } from '@streetmix/types'

function InfoBubbleControls (
  props: SectionElementTypeAndPosition
): React.ReactElement {
  const { type, position } = props
  const { locale, segmentInfo } = useSelector((state) => state.locale)
  const coastmixMode = useSelector((state) => state.flags.COASTMIX_MODE.value)

  // Determine width or height control type
  let widthOrHeightControl
  switch (type) {
    case 'slice':
      widthOrHeightControl = <WidthControl position={position} />
      break
    case 'boundary':
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
