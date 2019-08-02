import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import './Menu.scss'

class Menu extends React.PureComponent {
  static propTypes = {
    contentDirection: PropTypes.oneOf(['rtl', 'ltr']),
    className: PropTypes.string,
    isActive: PropTypes.bool.isRequired,
    menuItemNode: PropTypes.element,
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

  componentDidMount () {
    window.addEventListener('resize', this.updateMenuPosition)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.updateMenuPosition)
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

  /**
   * Determines actual position of the menu, based on the menu item position prop
   * passed in by <MenuBar />
   *
   * @returns {Object} an object with {left, top} values used for absolute positioning
   */
  getMenuPosition = () => {
    const el = this.el.current
    const { contentDirection, alignOpposite, menuItemNode } = this.props

    if (!el || !menuItemNode) return

    // Calculate left position
    let left

    // `rtl` content alignment
    if (contentDirection === 'rtl') {
      // If the menu width exceeds the left-most edge, or the `alignOpposite`
      // prop is true, the menu is aligned to the left-most edge
      const right = menuItemNode.offsetLeft + menuItemNode.offsetWidth
      if ((right - el.offsetWidth < 0) || (alignOpposite === true)) {
        left = 0
      } else {
        // Otherwise, align menu with the right edge of the menu item
        left = right - el.offsetWidth
      }
    } else {
      // `ltr` content alignment (default)
      // Get maximum (right-most) edge of menu bar
      const maxXPos = el.parentNode.offsetWidth

      // If the menu width exceeds the right-most edge, or the `alignOpposite`
      // prop is true, the menu is aligned to the right-most edge
      if ((menuItemNode.offsetLeft + el.offsetWidth > maxXPos) || (alignOpposite === true)) {
        left = maxXPos - el.offsetWidth
      } else {
        // Otherwise, align menu with the left edge of the menu item
        left = menuItemNode.offsetLeft
      }
    }

    // Get top position
    // Top of menu aligns with bottom of menu item
    const top = menuItemNode.offsetTop + menuItemNode.offsetHeight

    return {
      left,
      top
    }
  }

  updateMenuPosition = () => {
    const el = this.el.current
    const pos = this.getMenuPosition()

    // Set element position and make it visible
    if (el && pos) {
      el.style.left = pos.left + 'px'
      el.style.top = pos.top + 'px'
    }
  }

  show () {
    const el = this.el.current

    if (!el) return

    this.updateMenuPosition()
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
