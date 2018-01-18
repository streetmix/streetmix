import React from 'react'
import PropTypes from 'prop-types'
import { registerKeypress } from './keypress'

class ScrollIndicators extends React.Component {
  static propTypes = {
    posLeft: PropTypes.number.isRequired,
    posRight: PropTypes.number.isRequired,
    scrollStreet: PropTypes.func.isRequired,
    scrollTop: PropTypes.number.isRequired
  }

  shouldComponentUpdate (nextProps) {
    if (this.props.posLeft !== nextProps.posLeft &&
        this.props.posRight !== nextProps.posRight) {
      this.refs.left_indicator.innerHTML = Array(nextProps.posLeft + 1).join('‹')
      this.refs.right_indicator.innerHTML = Array(nextProps.posRight + 1).join('›')
      return true
    }
    // Checking if window was resized
    if (this.props.scrollTop !== nextProps.scrollTop) {
      this.updateIndicatorsPosition(nextProps.scrollTop)
      return true
    }
    return false
  }

  componentDidMount () {
    registerKeypress('left', (event) => { this.props.scrollStreet(true, event.shiftKey) })
    registerKeypress('right', (event) => { this.props.scrollStreet(false, event.shiftKey) })
  }

  updateIndicatorsPosition = (scrollTop) => {
    this.refs.left_indicator.style.top = scrollTop + 'px'
    this.refs.right_indicator.style.top = scrollTop + 'px'
  }

  render () {
    return (
      <div className="street-scroll-indicators">
        <div id="street-scroll-indicator-left" onClick={(e) => this.props.scrollStreet(true, e.shiftKey)} ref="left_indicator" />
        <div id="street-scroll-indicator-right" onClick={(e) => this.props.scrollStreet(false, e.shiftKey)} ref="right_indicator" />
      </div>
    )
  }
}

export default ScrollIndicators
