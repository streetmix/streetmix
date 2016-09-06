import React from 'react'

export default class Menu extends React.Component {
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
    // Aligns menu to the left side of the menu item.
    // Position is provided by the MenuBar component and passed in through props.
    if (this.props.alignment === 'left') {
      this.el.style.left = this.props.position[0] + 'px'
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

    // Determine positioning
    if (this.props.alignment === 'right') {
      // Note: this aligns to right edge of menu bar,
      // instead of the right side of the menu item.
      className += ' align-right'
    }

    return (
      <div className={className} ref={(ref) => { this.el = ref }}>
        {this.props.children}
      </div>
    )
  }
}

Menu.propTypes = {
  name: React.PropTypes.string, // TODO: transition
  className: React.PropTypes.string,
  alignment: React.PropTypes.oneOf(['left', 'right']).isRequired,
  isActive: React.PropTypes.bool.isRequired,
  position: React.PropTypes.array,
  onShow: React.PropTypes.func,
  onHide: React.PropTypes.func,
  children: React.PropTypes.node
}

Menu.defaultProps = {
  alignment: 'left',
  isActive: false,
  onShow: function () {}, // A no-op
  onHide: function () {}
}
