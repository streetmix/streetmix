import React, { memo, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { registerKeypress, deregisterKeypress } from './keypress'
import './ScrollIndicators.scss'

interface ScrollIndicatorsProps {
  left: number
  right: number
  scrollStreet: (direction: boolean, shift: boolean) => void
}

function ScrollIndicators ({
  scrollStreet,
  left = 0,
  right = 0
}: ScrollIndicatorsProps): React.ReactElement {
  const intl = useIntl()

  /**
   * Sets up and takes down event listeners for keys.
   *  - Left arrow scrolls left one screen
   *  - Right arrow scrolls right one screen
   *  - If shift is pressed, screen scrolls to extents.
   */
  useEffect(() => {
    registerKeypress(['left', 'shift left'], handleScrollLeft)
    registerKeypress(['right', 'shift right'], handleScrollRight)

    return () => {
      deregisterKeypress(['left', 'shift left'], handleScrollLeft)
      deregisterKeypress(['right', 'shift right'], handleScrollRight)
    }
  })

  function handleScrollLeft (
    event: React.KeyboardEvent | React.MouseEvent
  ): void {
    scrollStreet(true, event.shiftKey ?? false)
  }

  function handleScrollRight (
    event: React.KeyboardEvent | React.MouseEvent
  ): void {
    scrollStreet(false, event.shiftKey ?? false)
  }

  const scrollLeftLabel = intl.formatMessage({
    id: 'tooltip.scroll-street-left',
    defaultMessage: 'Scroll street left'
  })
  const scrollRightLabel = intl.formatMessage({
    id: 'tooltip.scroll-street-right',
    defaultMessage: 'Scroll street right'
  })

  return (
    <div className="street-scroll-indicators">
      {left > 0 && (
        <button
          className="street-scroll-indicator-left"
          onClick={handleScrollLeft}
          title={scrollLeftLabel}
          aria-label={scrollLeftLabel}
        >
          {Array(left + 1).join('‹')}
        </button>
      )}
      {right > 0 && (
        <button
          className="street-scroll-indicator-right"
          onClick={handleScrollRight}
          title={scrollRightLabel}
          aria-label={scrollRightLabel}
        >
          {Array(right + 1).join('›')}
        </button>
      )}
    </div>
  )
}

export default memo(ScrollIndicators)
