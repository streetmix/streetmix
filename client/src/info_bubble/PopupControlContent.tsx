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
  // const position = useSelector((state) => state.ui.activeSegment)
  const classNames = ['popup-controls-content']

  if (type === 'boundary') {
    classNames.push('popup-controls-boundary')
  }

  // let type = null
  // if (position === BUILDING_LEFT_POSITION) {
  //   type = INFO_BUBBLE_TYPE_LEFT_BUILDING
  //   classNames.push('popup-controls-boundary')
  // } else if (position === BUILDING_RIGHT_POSITION) {
  //   type = INFO_BUBBLE_TYPE_RIGHT_BUILDING
  //   classNames.push('popup-controls-boundary')
  // } else if (Number.isFinite(position)) {
  //   type = INFO_BUBBLE_TYPE_SEGMENT
  // } else {
  //   type = null
  // }

  // if (type === null || position === null) {
  //   console.log('thisis null')
  //   return null
  // }

  // console.log('rendering', type, position)

  return (
    <div className={classNames.join(' ')}>
      <InfoBubbleHeader type={type} position={position} />
      <InfoBubbleControls type={type} position={position} />
      <InfoBubbleLower position={position} />
    </div>
  )
}
