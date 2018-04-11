import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

class Menu extends React.PureComponent {
  static propTypes = {
    // contentDirection: PropTypes.oneOf(['rtl', 'ltr']),
    className: PropTypes.string,
    isActive: PropTypes.bool.isRequired,
    position: PropTypes.array,
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
    this.el.classList.add('visible')

    // Determine positioning
    // Aligns menu to the left side of the menu item, but aligns to the right side
    // of the menu bar if the menu is too wide.
    // Position is provided by the MenuBar component and passed in through props.
    const LEFT_RIGHT_INSET = 50 // match $left-right-inset in CSS
    const left = this.props.position[0]
    const width = this.el.offsetWidth
    const maxXPos = document.documentElement.clientWidth - LEFT_RIGHT_INSET
    let renderLeft
    if (left + width > maxXPos) {
      renderLeft = maxXPos - width
    } else {
      renderLeft = this.props.position[0]
    }
    this.el.style.left = renderLeft + 'px'
    // if rtl, recalculate left position based on right position of menu item

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
