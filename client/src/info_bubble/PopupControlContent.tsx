import React from 'react'

import { useSelector } from '~/src/store/hooks'
import {
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION
} from '../segments/constants'
import InfoBubbleControls from './InfoBubbleControls'
import InfoBubbleHeader from './InfoBubbleHeader'
import InfoBubbleLower from './InfoBubbleLower'
import {
  INFO_BUBBLE_TYPE_SEGMENT,
  INFO_BUBBLE_TYPE_LEFT_BUILDING,
  INFO_BUBBLE_TYPE_RIGHT_BUILDING
} from './constants'
import './PopupControls.css'

import type { SectionType, BoundaryPosition, Optional } from '@streetmix/types'

interface PopupControlContentProps {
  type: SectionType
  position: number | BoundaryPosition
}

export function PopupControlContent ({
  type,
  position
}: PopupControlContentProps): React.ReactNode | null {
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
