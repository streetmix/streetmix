import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import './Menu.scss'

class Menu extends React.PureComponent {
  static propTypes = {
    contentDirection: PropTypes.oneOf(['rtl', 'ltr']),
    className: PropTypes.string,
    isActive: PropTypes.bool.isRequired,
    position: PropTypes.shape({
      left: PropTypes.number,
      right: PropTypes.number,
      top: PropTypes.number,
      bottom: PropTypes.number,
      x: PropTypes.number,
      y: PropTypes.number
    }),
    alignOpposite: PropTypes.bool,
    onShow: PropTypes.func,
    onHide: PropTypes.func,
    children: PropTypes.node
  }

  static defaultProps = {
    isActive: false,
    alignOpposite: false,
    onShow: function () {}, // A no-op
    onHide: function () {}
  }

  constructor (props) {
    super(props)

    this.el = React.createRef()
  }

  /**
   * Show or hide the menu, and run callback functions, depending on whether
   * the next active state is different from the previous one.
   *
   * This check occurs in `componentDidUpdate` so that `this.show` has access
   * to current props, which contains the position the menu should be displayed at.
   */
  componentDidUpdate (prevProps, prevState) {
    if (!prevProps.isActive && this.props.isActive) {
      this.show()
    } else if (prevProps.isActive && !this.props.isActive) {
      this.hide()
    }
  }

  show () {
    const { contentDirection, alignOpposite, position } = this.props

    if (!position) return

    const el = this.el.current

    // Determine final position of menu
    // Menu position is calculated from the menu item position prop passed in by <MenuBar />.
    let xPos

    // `rtl` content alignment
    if (contentDirection === 'rtl') {
      // If the menu width exceeds the left-most edge, or the `alignOpposite`
      // prop is true, the menu is aligned to the left-most edge
      if ((position.right - el.offsetWidth < 0) || (alignOpposite === true)) {
        xPos = 0
      } else {
        // Otherwise, align menu with the right edge of the menu item
        xPos = position.right - el.offsetWidth
      }
    } else {
      // `ltr` content alignment (default)
      // Get maximum (right-most) edge of menu bar
      const maxXPos = el.parentNode.offsetWidth

      // If the menu width exceeds the right-most edge, or the `alignOpposite`
      // prop is true, the menu is aligned to the right-most edge
      if ((position.left + el.offsetWidth > maxXPos) || (alignOpposite === true)) {
        xPos = maxXPos - el.offsetWidth
      } else {
        // Otherwise, align menu with the left edge of the menu item
        xPos = position.left
      }
    }

    // Top of menu aligns with bottom of menu item
    const yPos = position.bottom

    // Set element position and make it visible
    el.style.left = xPos + 'px'
    el.style.top = yPos + 'px'
    el.classList.add('menu-visible')

    // Callback function, if provided
    if (this.props.onShow) {
      this.props.onShow()
    }
  }

  hide () {
    if (this.el.current) {
      this.el.current.classList.remove('menu-visible')
    }

    // Callback function, if provided
    if (this.props.onHide) {
      this.props.onHide()
    }
  }

  render () {
    let className = 'menu'

    if (this.props.className) {
      className += ` ${this.props.className}`
    }

    return (
      <div className={className} ref={this.el}>
        {this.props.children}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    contentDirection: state.app.contentDirection
  }
}

export default connect(mapStateToProps)(Menu)
