/**
 * Adds scroll buttons to UI elements.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { animate } from '../util/helpers'
import { ICON_CHEVRON_LEFT, ICON_CHEVRON_RIGHT } from '../ui/icons'
import { registerKeypress, deregisterKeypress } from '../app/keypress'

const SCROLL_ANIMATE_DURATION = 300 // in ms

export default class Scrollable extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    setRef: PropTypes.func,
    onScroll: PropTypes.func,
    allowKeyboardScroll: PropTypes.bool
  }

  static defaultProps = {
    setRef: () => {},
    onScroll: () => {},
    allowKeyboardScroll: false
  }

  constructor (props) {
    super(props)

    this.scrollerEl = React.createRef()
    this.leftButtonEl = React.createRef()
    this.rightButtonEl = React.createRef()
  }

  componentDidMount () {
    window.addEventListener('resize', this.checkButtonVisibilityState)

    if (this.props.allowKeyboardScroll === true) {
      registerKeypress('left', this.onClickLeft)
      registerKeypress('right', this.onClickRight)
    }

    // TODO: can this be placed in stylesheets?
    this.leftButtonEl.current.style.left = '-15px'
    this.rightButtonEl.current.style.right = '-15px'

    this.checkButtonVisibilityState()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.checkButtonVisibilityState)

    if (this.props.allowKeyboardScroll === true) {
      deregisterKeypress('left', this.onClickLeft)
      deregisterKeypress('right', this.onClickRight)
    }
  }

  onClickLeft = (event) => {
    const el = this.scrollerEl.current
    const position = el.scrollLeft - (el.offsetWidth - 150) // TODO: document magic number

    animate(el, { scrollLeft: position }, SCROLL_ANIMATE_DURATION)
  }

  onClickRight = (event) => {
    const el = this.scrollerEl.current
    const position = el.scrollLeft + (el.offsetWidth - 150) // TODO: document magic number

    animate(el, { scrollLeft: position }, SCROLL_ANIMATE_DURATION)
  }

  onScrollContainer = (event) => {
    this.checkButtonVisibilityState()

    // If parent has provided its own onScroll handler function, call that now.
    this.props.onScroll(event)
  }

  // Allows parent component to obtain a ref to the wrapping element created here.
  setWrapperElementRef = (ref) => {
    this.props.setRef(ref)
  }

  checkButtonVisibilityState = () => {
    const el = this.scrollerEl.current
    const leftButtonEl = this.leftButtonEl.current
    const rightButtonEl = this.rightButtonEl.current

    // We set styles manually instead of setting `disabled` as before; it's
    // because a button in a disabled state doesn't seem to get onClick
    // handlers attached.
    if (el.scrollLeft === 0) {
      leftButtonEl.style.opacity = 0
      leftButtonEl.style.pointerEvents = 'none'
    } else {
      leftButtonEl.style.opacity = 1
      leftButtonEl.style.pointerEvents = 'auto'
    }

    if (el.scrollLeft === el.scrollWidth - el.offsetWidth) {
      rightButtonEl.style.opacity = 0
      rightButtonEl.style.pointerEvents = 'none'
    } else {
      rightButtonEl.style.opacity = 1
      rightButtonEl.style.pointerEvents = 'auto'
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
          ref={this.scrollerEl}
        >
          {this.props.children}
        </div>
        <button
          className="scrollable scroll-left"
          onClick={this.onClickLeft}
          ref={this.leftButtonEl}
        >
          <FontAwesomeIcon icon={ICON_CHEVRON_LEFT} />
        </button>
        <button
          className="scrollable scroll-right"
          onClick={this.onClickRight}
          ref={this.rightButtonEl}
        >
          <FontAwesomeIcon icon={ICON_CHEVRON_RIGHT} />
        </button>
      </div>
    )
  }
}
