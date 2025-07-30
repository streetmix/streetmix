import React from 'react'

import { useDispatch } from '~/src/store/hooks'
import { loseAnyFocus } from '~/src/util/focus'
import { TooltipGroup } from '~/src/ui/Tooltip'
import { setInfoBubbleMouseInside } from '../store/slices/infoBubble'
import InfoBubbleControls from './InfoBubbleControls'
import InfoBubbleHeader from './InfoBubbleHeader'
import InfoBubbleLower from './InfoBubbleLower'
import './PopupControls.css'
import './InfoBubble.css' // TODO: combine

import type { SectionElementTypeAndPosition } from '@streetmix/types'

type PopupControlContentProps = SectionElementTypeAndPosition & {
  setArrowHighlighted: (v: boolean) => void
}

export function PopupControlContent ({
  type,
  position,
  setArrowHighlighted
}: PopupControlContentProps): React.ReactNode | null {
  const dispatch = useDispatch()

  const classNames = ['popup-controls-content']

  if (type === 'boundary') {
    classNames.push('popup-controls-boundary')
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
        <InfoBubbleHeader type={type} position={position} />
        <InfoBubbleControls type={type} position={position} />
        <InfoBubbleLower
          position={position}
          setArrowHighlighted={setArrowHighlighted}
        />
      </TooltipGroup>
    </div>
  )
}
