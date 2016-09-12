/**
 * Adds scroll buttons to UI elements.
 */
import React from 'react'
import $ from 'jquery'

export default class Scrollable extends React.PureComponent {
  constructor (props) {
    super(props)

    this.duration = 300

    this.updateScrollButtons = this.updateScrollButtons.bind(this)
    this.repositionButtons = this.repositionButtons.bind(this)
    this.checkButtonVisibilityState = this.checkButtonVisibilityState.bind(this)
    this.onClickLeft = this.onClickLeft.bind(this)
    this.onClickRight = this.onClickRight.bind(this)
    this.onScrollContainer = this.onScrollContainer.bind(this)
  }

  componentDidMount () {
    window.addEventListener('resize', () => {
      this.updateScrollButtons()
    })

    this.updateScrollButtons()
  }

  updateScrollButtons () {
    this.repositionButtons()
    this.checkButtonVisibilityState()
  }

  repositionButtons () {
    const el = this.scroller

    this.leftButton.style.left = el.getBoundingClientRect().left + 'px'
    this.rightButton.style.left = (el.getBoundingClientRect().left + el.offsetWidth) + 'px'
  }

  checkButtonVisibilityState () {
    const el = this.scroller

    // We set styles manually instead of setting `disabled` as before; it's
    // because a button in a disabled state doesn't seem to get onClick
    // handlers attached.
    if (el.scrollLeft === 0) {
      this.leftButton.style.opacity = 0
      this.leftButton.style.pointerEvents = 'none'
    } else {
      this.leftButton.style.opacity = 1
      this.leftButton.style.pointerEvents = 'auto'
    }

    if (el.scrollLeft === el.scrollWidth - el.offsetWidth) {
      this.rightButton.style.opacity = 0
      this.rightButton.style.pointerEvents = 'none'
    } else {
      this.rightButton.style.opacity = 1
      this.rightButton.style.pointerEvents = 'auto'
    }
  }

  onClickLeft (event) {
    const el = this.scroller
    const position = el.scrollLeft - (el.offsetWidth - 150) // TODO: document magic number

    $(el).animate({ scrollLeft: position }, this.duration)
  }

  onClickRight (event) {
    const el = this.scroller
    const position = el.scrollLeft + (el.offsetWidth - 150) // TODO: document magic number

    $(el).animate({ scrollLeft: position }, this.duration)
  }

  onScrollContainer (event) {
    this.checkButtonVisibilityState()
  }

  render () {
    return (
      <div>
        <div {...this.props} onScroll={this.onScrollContainer} ref={(ref) => { this.scroller = ref }}>
          {this.props.children}
        </div>
        <button
          className='scroll scroll-left'
          onClick={this.onClickLeft}
          ref={(ref) => { this.leftButton = ref }}
        >
          «
        </button>
        <button
          className='scroll scroll-right'
          onClick={this.onClickRight}
          ref={(ref) => { this.rightButton = ref }}
        >
          »
        </button>
      </div>
    )
  }
}

Scrollable.propTypes = {
  children: React.PropTypes.node
}
