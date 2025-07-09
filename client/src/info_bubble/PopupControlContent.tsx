import React from 'react'

import InfoBubbleControls from './InfoBubbleControls'
import InfoBubbleHeader from './InfoBubbleHeader'
import InfoBubbleLower from './InfoBubbleLower'
import './PopupControls.css'

import type { SectionElementTypeAndPosition } from '@streetmix/types'

export function PopupControlContent ({
  type,
  position
}: SectionElementTypeAndPosition): React.ReactNode | null {
  const classNames = ['popup-controls-content']

  if (type === 'boundary') {
    classNames.push('popup-controls-boundary')
  }

  return (
    <div className={classNames.join(' ')}>
      <InfoBubbleHeader type={type} position={position} />
      <InfoBubbleControls type={type} position={position} />
      <InfoBubbleLower position={position} />
    </div>
  )
}
