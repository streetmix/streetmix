import React from 'react'

import { getElAbsolutePos } from '../util/helpers'

export default class Menu extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      visible: false
    }
  }

  componentDidMount () {
    // Set up menu bar button - TODO: Reactify - don't do it here
    const menuButtonEl = document.querySelector(`#${this.props.name}-menu-button`)

    if (menuButtonEl) {
      // Bind event listeners to the menu button
      menuButtonEl.addEventListener('pointerdown', (event) => {
        // Toggle visibility state
        this.setState({ visible: !this.state.visible })
      })
    }
  }

  /**
   * Show or hide the menu, and run callback functions, depending on whether
   * the next visible state is different from the previous one.
   *
   * Callback functions may mutate state, so `shouldComponentUpdate` still
   * returns `true`.
   */
  shouldComponentUpdate (nextProps, nextState) {
    if (!this.state.visible && nextState.visible) {
      this.show()
    } else if (this.state.visible && !nextState.visible) {
      this.hide()
    }

    return true
  }

  show () {
    this.el.classList.add('visible')

    // Determine positioning
    // Aligns menu to the left side of the menu item.
    if (this.props.alignment === 'left') {
      // TODO: don't rely on hard-coded ID of menu
      const pos = getElAbsolutePos(document.querySelector(`#${this.props.name}-menu-item`))
      this.el.style.left = pos[0] + 'px'
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
  position: React.PropTypes.array,
  onShow: React.PropTypes.func,
  onHide: React.PropTypes.func,
  children: React.PropTypes.node
}

Menu.defaultProps = {
  alignment: 'left',
  onShow: function () {}, // A no-op
  onHide: function () {}
}
