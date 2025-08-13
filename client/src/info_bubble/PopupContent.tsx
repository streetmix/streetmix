import React from 'react'

import { useDispatch } from '~/src/store/hooks'
import { loseAnyFocus } from '~/src/util/focus'
import { TooltipGroup } from '~/src/ui/Tooltip'
import { setInfoBubbleMouseInside } from '../store/slices/infoBubble'
import InfoBubbleControls from './InfoBubbleControls'
import { PopupHeader } from './PopupHeader'
import { PopupLower } from './PopupLower'

import type { SectionElementTypeAndPosition } from '@streetmix/types'

type PopupContentProps = SectionElementTypeAndPosition & {
  setArrowHighlighted: (v: boolean) => void
}

export function PopupContent ({
  type,
  position,
  setArrowHighlighted
}: PopupContentProps): React.ReactNode | null {
  const dispatch = useDispatch()

  const classNames = ['popup-content']

  if (type === 'boundary') {
    classNames.push('popup-at-boundary')
  }

  function handleMouseEnter () {
    dispatch(setInfoBubbleMouseInside(true))
  }

  function handleMouseLeave () {
    dispatch(setInfoBubbleMouseInside(false))

    // Returns focus to body when pointer leaves the info bubble area
    // so that keyboard commands respond to pointer position rather than
    // any focused buttons/inputs
    // TODO: do we still need this? (ported from legacy infobubble)
    loseAnyFocus()
  }

  return (
    <div
      className={classNames.join(' ')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <TooltipGroup>
        <PopupHeader type={type} position={position} />
        <InfoBubbleControls type={type} position={position} />
        <PopupLower
          position={position}
          setArrowHighlighted={setArrowHighlighted}
        />
      </TooltipGroup>
    </div>
  )
}
