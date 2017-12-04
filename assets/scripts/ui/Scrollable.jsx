/**
 * Adds scroll buttons to UI elements.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { animate } from '../util/helpers'

export default class Scrollable extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    setRef: PropTypes.func
  }

  static defaultProps = {
    setRef: function noop () {}
  }

  constructor (props) {
    super(props)

    this.duration = 300
  }

  componentDidMount () {
    window.addEventListener('resize', this.checkButtonVisibilityState)

    this.leftButton.style.left = '-15px'
    this.rightButton.style.right = '-15px'

    this.checkButtonVisibilityState()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.checkButtonVisibilityState)
  }

  onClickLeft = (event) => {
    const el = this.scroller
    const position = el.scrollLeft - (el.offsetWidth - 150) // TODO: document magic number

    animate(el, { scrollLeft: position }, this.duration)
  }

  onClickRight = (event) => {
    const el = this.scroller
    const position = el.scrollLeft + (el.offsetWidth - 150) // TODO: document magic number

    animate(el, { scrollLeft: position }, this.duration)
  }

  onScrollContainer = (event) => {
    this.checkButtonVisibilityState()
  }

  // Allows parent component to obtain a ref to the wrapping element created here.
  setWrapperElementRef = (ref) => {
    this.props.setRef(ref)
  }

  checkButtonVisibilityState = () => {
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

  render () {
    let containerClassName

    if (this.props.className) {
      containerClassName = `${this.props.className}-scrollable-container`
    }

    return (
      <div className={containerClassName} ref={this.setWrapperElementRef}>
        <div
          className={this.props.className}
          onScroll={this.onScrollContainer}
          ref={(ref) => { this.scroller = ref }}
        >
          {this.props.children}
        </div>
        <button
          className="scrollable scroll-left"
          onClick={this.onClickLeft}
          ref={(ref) => { this.leftButton = ref }}
        >
          «
        </button>
        <button
          className="scrollable scroll-right"
          onClick={this.onClickRight}
          ref={(ref) => { this.rightButton = ref }}
        >
          »
        </button>
      </div>
    )
  }
}
