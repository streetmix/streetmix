import React from 'react'

import { useDispatch } from '~/src/store/hooks'
import { loseAnyFocus } from '~/src/util/focus'
import { TooltipGroup } from '~/src/ui/Tooltip'
import { setInfoBubbleMouseInside } from '../store/slices/infoBubble'
import { PopupControls } from './PopupControls'
import { PopupHeader } from './PopupHeader'
import { PopupLower } from './PopupLower'

import type { SectionElementTypeAndPosition, Prettify } from '@streetmix/types'

type PopupContentProps = Prettify<
  SectionElementTypeAndPosition & {
    setArrowHighlighted: (v: boolean) => void
  }
>

// `...props` is a discriminated union of `SectionElementTypeAndPosition`,
// do not destructure it or it will lose type safety!
export function PopupContent({
  setArrowHighlighted,
  ...props
}: PopupContentProps) {
  const dispatch = useDispatch()

  const classNames = ['popup-content']

  if (props.type === 'boundary') {
    classNames.push('popup-at-boundary')
  }

  function handleMouseEnter() {
    dispatch(setInfoBubbleMouseInside(true))
  }

  function handleMouseLeave() {
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
        <PopupHeader {...props} />
        <PopupControls {...props} />
        <PopupLower setArrowHighlighted={setArrowHighlighted} {...props} />
      </TooltipGroup>
    </div>
  )
}
