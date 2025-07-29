import React from 'react'

import { TooltipGroup } from '~/src/ui/Tooltip'
import InfoBubbleControls from './InfoBubbleControls'
import InfoBubbleHeader from './InfoBubbleHeader'
import InfoBubbleLower from './InfoBubbleLower'
import './PopupControls.css'

import type { SectionElementTypeAndPosition } from '@streetmix/types'

type PopupControlContentProps = SectionElementTypeAndPosition & {
  setArrowHighlighted: (v: boolean) => void
}

export function PopupControlContent ({
  type,
  position,
  setArrowHighlighted
}: PopupControlContentProps): React.ReactNode | null {
  const classNames = ['popup-controls-content']

  if (type === 'boundary') {
    classNames.push('popup-controls-boundary')
  }

  return (
    <div className={classNames.join(' ')}>
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
