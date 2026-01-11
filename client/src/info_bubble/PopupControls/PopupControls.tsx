import { IntlProvider } from 'react-intl'

import { useSelector } from '~/src/store/hooks.js'
import { VariantSet } from './VariantSet.js'
import { WidthControl } from './WidthControl.js'
import { BuildingHeightControl } from './BuildingHeightControl.js'
import { ElevationControl } from './ElevationControl.js'
import { CoastalFloodingButton } from './CoastalFloodingButton.js'
import { SlopeControl } from './SlopeControl.js'
import './PopupControls.css'

import type { SectionElementTypeAndPosition } from '@streetmix/types'

export function PopupControls(props: SectionElementTypeAndPosition) {
  const { type, position } = props
  const { locale, segmentInfo } = useSelector((state) => state.locale)
  const universalElevation = useSelector(
    (state) => state.flags.UNIVERSAL_ELEVATION_CONTROLS.value
  )
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
        <IntlProvider locale={locale} messages={segmentInfo}>
          <VariantSet type={type} position={position} />
        </IntlProvider>
        <div className="non-variant">
          {widthOrHeightControl}

          {/* Universal elevation control for slices only, if not in Coastmix mode */}
          {typeof position === 'number' &&
            universalElevation &&
            !coastmixMode && (
              <div className="popup-control-group">
                <ElevationControl position={position} />
              </div>
            )}
          {coastmixMode && (
            <>
              <ElevationControl position={position} />
              {/* No slope control for boundaries */}
              {typeof position === 'number' && (
                <SlopeControl position={position} />
              )}
            </>
          )}
        </div>
      </div>
      {coastmixMode && (
        <CoastalFloodingButton type={type} position={position} />
      )}
    </div>
  )
}
