import React from 'react'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { showCoastmixControls } from '~/src/store/slices/coastmix'
import BetaTag from '~/src/menubar/menus/BetaTag'
import Button from '~/src/ui/Button'
import './CoastmixControlsButton.css'

import type { SectionElementTypeAndPosition } from '@streetmix/types'

function CoastmixControlsButton (
  props: SectionElementTypeAndPosition
): React.ReactElement | null {
  const { type, position } = props

  // Get the appropriate variant information
  const variant = useSelector((state) => {
    if (type === 'boundary') {
      return state.street.boundary[position].variant
    }

    return null
  })
  const dispatch = useDispatch()

  if (type === 'slice' || variant !== 'waterfront') return null

  function handleClick () {
    dispatch(showCoastmixControls())
  }

  return (
    <div className="popup-control-set">
      <Button onClick={handleClick} className="coastmix-controls-button">
        Flood controls <BetaTag />
      </Button>
    </div>
  )
}

export default CoastmixControlsButton
