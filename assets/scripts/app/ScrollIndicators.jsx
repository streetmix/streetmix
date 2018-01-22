import React from 'react'
import PropTypes from 'prop-types'
import { registerKeypress } from './keypress'

class ScrollIndicators extends React.PureComponent {
  static propTypes = {
    posLeft: PropTypes.number.isRequired,
    posRight: PropTypes.number.isRequired,
    scrollStreet: PropTypes.func.isRequired,
    scrollTop: PropTypes.number.isRequired
  }

  componentDidMount () {
    registerKeypress('left', this.handleLeftScroll)
    registerKeypress('right', this.handleRightScroll)
  }

  handleLeftScroll = (event) => {
    this.props.scrollStreet(true, event.shiftKey)
  }

  handleRightScroll = (event) => {
    this.props.scrollStreet(false, event.shiftKey)
  }

  render () {
    const { scrollTop, posLeft, posRight } = this.props
    const style = {
      position: 'absolute',
      top: scrollTop + 'px'
    }

    return (
      <div className="street-scroll-indicators" style={style}>
        <div 
          id="street-scroll-indicator-left" 
          onClick={this.handleLeftScroll} 
        >
          {Array(posLeft + 1).join('‹')}
        </div>
        <div 
          id="street-scroll-indicator-right" 
          onClick={this.handleRightScroll} 
        >
          {Array(posRight + 1).join('›')}
        </div>
      </div>
    )
  }
}

export default ScrollIndicators
