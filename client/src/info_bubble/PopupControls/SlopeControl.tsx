import React from 'react'
import { FormattedMessage } from 'react-intl'

import { segmentsChanged } from '~/src/segments/view'
import { useSelector, useDispatch } from '~/src/store/hooks'
import { toggleSliceSlope } from '~/src/store/slices/street'
import Switch from '~/src/ui/Switch'

import type { BoundaryPosition } from '@streetmix/types'

interface SlopeControlProps {
  position: number | BoundaryPosition
}

export function SlopeControl({ position }: SlopeControlProps) {
  const isSloped = useSelector((state) => {
    if (typeof position === 'number') {
      return state.street.segments[position].slope.on
    } else {
      return false
    }
  })

  const dispatch = useDispatch()

  function handleSlopeChange(checked: boolean): void {
    if (typeof position === 'number') {
      dispatch(toggleSliceSlope(position, checked))
      segmentsChanged()
    }
  }

  // No slope control for boundaries
  if (typeof position !== 'number') {
    return null
  }

  return (
    <div className="popup-control-row">
      <div className="popup-control-label">
        <FormattedMessage id="segments.controls.slope" defaultMessage="Slope" />
      </div>
      <div>
        <Switch onCheckedChange={handleSlopeChange} checked={isSloped} />
      </div>
    </div>
  )
}
