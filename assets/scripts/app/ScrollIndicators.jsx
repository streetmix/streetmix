import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import { registerKeypress, deregisterKeypress } from './keypress'
import './ScrollIndicators.scss'

const ScrollIndicators = (props) => {
  const { scrollTop, scrollStreet, scrollIndicatorsLeft, scrollIndicatorsRight } = props

  const doLeftScroll = (event) => {
    scrollStreet(true, event.shiftKey)
  }

  const doRightScroll = (event) => {
    scrollStreet(false, event.shiftKey)
  }

  /**
   * Sets up and takes down event listeners for keys.
   *  - Left arrow scrolls left one screen
   *  - Right arrow scrolls right one screen
   *  - If shift is pressed, screen scrolls to extents.
   */
  useEffect(() => {
    registerKeypress(['left', 'shift left'], doLeftScroll)
    registerKeypress(['right', 'shift right'], doRightScroll)
    return () => {
      deregisterKeypress(['left', 'shift left'], doLeftScroll)
      deregisterKeypress(['right', 'shift right'], doRightScroll)
    }
  })

  const intl = useIntl()
  const scrollLeftLabel = intl.formatMessage({
    id: 'tooltip.scroll-street-left',
    defaultMessage: 'Scroll street left'
  })
  const scrollRightLabel = intl.formatMessage({
    id: 'tooltip.scroll-street-right',
    defaultMessage: 'Scroll street right'
  })

  return (
    <div className="street-scroll-indicators" style={{ top: `${scrollTop}px` }}>
      {scrollIndicatorsLeft ? (
        <button
          className="street-scroll-indicator-left"
          onClick={doLeftScroll}
          title={scrollLeftLabel}
          aria-label={scrollLeftLabel}
        >
          {Array(scrollIndicatorsLeft + 1).join('‹')}
        </button>
      ) : null}
      {scrollIndicatorsRight ? (
        <button
          className="street-scroll-indicator-right"
          onClick={doRightScroll}
          title={scrollRightLabel}
          aria-label={scrollRightLabel}
        >
          {Array(scrollIndicatorsRight + 1).join('›')}
        </button>
      ) : null}
    </div>
  )
}

ScrollIndicators.propTypes = {
  scrollIndicatorsLeft: PropTypes.number,
  scrollIndicatorsRight: PropTypes.number,
  scrollStreet: PropTypes.func.isRequired,
  scrollTop: PropTypes.number.isRequired
}

ScrollIndicators.defaultProps = {
  scrollIndicatorsLeft: 0,
  scrollIndicatorsRight: 0
}

export default React.memo(ScrollIndicators)
