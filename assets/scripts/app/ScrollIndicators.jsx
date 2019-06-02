import React from 'react'
import PropTypes from 'prop-types'
import { registerKeypress, deregisterKeypress } from './keypress'

class ScrollIndicators extends React.PureComponent {
  static propTypes = {
    scrollIndicatorsLeft: PropTypes.number,
    scrollIndicatorsRight: PropTypes.number,
    scrollStreet: PropTypes.func.isRequired,
    scrollTop: PropTypes.number.isRequired
  }

  static defaultProps = {
    scrollIndicatorsLeft: 0,
    scrollIndicatorsRight: 0
  }

  componentDidMount () {
    registerKeypress(['left', 'shift left'], this.handleLeftScroll)
    registerKeypress(['right', 'shift right'], this.handleRightScroll)
  }

  componentWillUnmount () {
    deregisterKeypress(['left', 'shift left'], this.handleLeftScroll)
    deregisterKeypress(['right', 'shift right'], this.handleRightScroll)
  }

  handleLeftScroll = (event) => {
    this.props.scrollStreet(true, event.shiftKey)
  }

  handleRightScroll = (event) => {
    this.props.scrollStreet(false, event.shiftKey)
  }

  render () {
    const { scrollTop, scrollIndicatorsLeft, scrollIndicatorsRight } = this.props
    const style = {
      position: 'absolute',
      top: scrollTop + 'px'
    }

    return (
      <div className="street-scroll-indicators" style={style}>
        <div
          className="street-scroll-indicator-left"
          onClick={this.handleLeftScroll}
        >
          {Array(scrollIndicatorsLeft + 1).join('‹')}
        </div>
        <div
          className="street-scroll-indicator-right"
          onClick={this.handleRightScroll}
        >
          {Array(scrollIndicatorsRight + 1).join('›')}
        </div>
      </div>
    )
  }
}

export default ScrollIndicators
