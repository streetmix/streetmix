import React from 'react'
import { FormattedMessage } from 'react-intl'
import { Popup } from 'react-leaflet'

import Button from '../../ui/Button'

import type { LatLngObject } from '@streetmix/types'
import type { PointExpression } from 'leaflet'

const POPUP_MAX_WIDTH = 300
const POPUP_OFFSET: PointExpression = [0, -30]

interface LocationPopupProps {
  position: LatLngObject
  label: string
  isEditable: boolean
  isClearable: boolean
  handleConfirm: (event: React.MouseEvent) => void
  handleClear: (event: React.MouseEvent) => void
}

const LocationPopup = ({
  position,
  label,
  isEditable = false,
  isClearable = false,
  handleConfirm,
  handleClear
}: LocationPopupProps): React.ReactElement => {
  return (
    <Popup
      position={position}
      offset={POPUP_OFFSET}
      maxWidth={POPUP_MAX_WIDTH}
      closeButton={false}
      closeOnClick={false}
    >
      <div className="geotag-location-label">{label}</div>
      {isEditable &&
        (isClearable
          ? (
            <div>
              <Button tertiary={true} onClick={handleClear}>
                <FormattedMessage
                  id="dialogs.geotag.clear-location"
                  defaultMessage="Clear location"
                />
              </Button>
            </div>
            )
          : (
            <div>
              <Button primary={true} onClick={handleConfirm}>
                <FormattedMessage
                  id="dialogs.geotag.confirm-location"
                  defaultMessage="Confirm location"
                />
              </Button>
            </div>
            ))}
    </Popup>
  )
}

export default LocationPopup
