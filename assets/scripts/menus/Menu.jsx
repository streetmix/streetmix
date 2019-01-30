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
    onShow: PropTypes.func,
    onHide: PropTypes.func,
    children: PropTypes.node
  }

  static defaultProps = {
    alignment: 'left',
    isActive: false,
    onShow: function () {}, // A no-op
    onHide: function () {}
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
    if (!this.props.position) return

    this.el.classList.add('visible')

    const LEFT_RIGHT_INSET = 30 // match $left-right-inset in CSS

    // Determine positioning
    // Aligns menu to the left side of the menu item, but aligns to the right side
    // of the menu bar if the menu is too wide.
    // Position is provided by the MenuBar component and passed in through props.
    // If rtl, calculate alignment position based on right edge of menu item
    if (this.props.contentDirection === 'rtl') {
      const right = this.props.position.right
      const width = this.el.offsetWidth
      const minXPos = LEFT_RIGHT_INSET
      let xPos
      if (right - width < minXPos) {
        xPos = minXPos
      } else {
        xPos = right - width
      }
      this.el.style.left = xPos + 'px'
    } else {
      // Otherwise, assume ltr, and align to left edge of menu item
      const left = this.props.position.left
      const width = this.el.offsetWidth
      const maxXPos = document.documentElement.clientWidth - LEFT_RIGHT_INSET
      let xPos
      if (left + width > maxXPos) {
        xPos = maxXPos - width
      } else {
        xPos = left
      }
      this.el.style.left = xPos + 'px'
    }

    if (this.props.onShow) {
      this.props.onShow()
    }
  }

  hide () {
    this.el.classList.remove('visible')

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
      <div className={className} ref={(ref) => { this.el = ref }}>
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
