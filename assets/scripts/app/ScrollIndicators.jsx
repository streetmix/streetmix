import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
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

  useEffect(() => {
    registerKeypress(['left', 'shift left'], doLeftScroll)
    registerKeypress(['right', 'shift right'], doRightScroll)
    return () => {
      deregisterKeypress(['left', 'shift left'], doLeftScroll)
      deregisterKeypress(['right', 'shift right'], doRightScroll)
    }
  })

  return (
    <div className="street-scroll-indicators" style={{ top: `${scrollTop}px` }}>
      <div
        className="street-scroll-indicator-left"
        onClick={doLeftScroll}
      >
        {Array(scrollIndicatorsLeft + 1).join('‹')}
      </div>
      <div
        className="street-scroll-indicator-right"
        onClick={doRightScroll}
      >
        {Array(scrollIndicatorsRight + 1).join('›')}
      </div>
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
