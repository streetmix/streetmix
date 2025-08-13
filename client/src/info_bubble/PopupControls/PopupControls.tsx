import React from 'react'
import { IntlProvider } from 'react-intl'

import { useSelector } from '~/src/store/hooks'
import Variants from './Variants'
import WidthControl from './WidthControl'
import BuildingHeightControl from './BuildingHeightControl'
import ElevationControl from './ElevationControl'
import CoastmixControlsButton from './CoastmixControlsButton'
import './PopupControls.css'

import type { SectionElementTypeAndPosition } from '@streetmix/types'

export function PopupControls (
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
    <div className="popup-controls">
      <div className="popup-control-group">
        <div className="popup-control-row">
          <IntlProvider locale={locale} messages={segmentInfo}>
            <Variants type={type} position={position} />
          </IntlProvider>
          {widthOrHeightControl}
        </div>
      </div>
      {/* Only enabled for segments right now or Coastmix mode */}
      {(coastmixMode || typeof position === 'number') && (
        <div className="popup-control-group">
          <ElevationControl position={position} />
        </div>
      )}
      {coastmixMode && (
        <CoastmixControlsButton type={type} position={position} />
      )}
    </div>
  )
}
