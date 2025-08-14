import React from 'react'
import { FormattedMessage } from 'react-intl'

import { segmentsChanged } from '~/src/segments/view'
import { useSelector, useDispatch } from '~/src/store/hooks'
import { changeSegmentProperties } from '~/src/store/slices/street'
import Switch from '~/src/ui/Switch'

import type { BoundaryPosition } from '@streetmix/types'

interface SlopeControlProps {
  position: number | BoundaryPosition
}

export function SlopeControl ({ position }: SlopeControlProps) {
  const slope = useSelector((state) => {
    if (typeof position === 'number') {
      return state.street.segments[position].slope ?? false
    } else {
      return false
    }
  })

  const dispatch = useDispatch()

  function handleSlopeChange (checked: boolean): void {
    if (typeof position === 'number') {
      dispatch(changeSegmentProperties(position, { slope: checked }))
      segmentsChanged()
    }
  }

  return (
    <div className="popup-control-row">
      <div className="popup-control-label">
        <FormattedMessage id="segments.controls.slope" defaultMessage="Slope" />
      </div>
      <div>
        <Switch onCheckedChange={handleSlopeChange} checked={slope} />
      </div>
    </div>
  )
}
