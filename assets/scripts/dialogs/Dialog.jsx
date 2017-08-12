/**
 * Dialog (class)
 *
 * Generic class instance of dialog
 *
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { hideAllMenus } from '../menus/menu_controller'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import { clearDialogs } from '../store/actions/dialogs'

class Dialog extends React.Component {
  constructor (props) {
    super(props)

    this.onClickShield = this.onClickShield.bind(this)
    this.unmountDialog = this.unmountDialog.bind(this)
  }

  componentDidMount () {
    hideAllMenus()

    // Set up keypress listener to close dialogs if open
    registerKeypress('esc', this.unmountDialog)
  }

  componentWillUnmount () {
    deregisterKeypress('esc', this.unmountDialog)
  }

  unmountDialog () {
    this.props.dispatch(clearDialogs())
  }

  onClickShield () {
    if (!this.props.disableShieldExit) {
      this.unmountDialog()
    }
  }

  render () {
    let className = 'dialog-box'
    if (this.props.className !== undefined) {
      className += ` ${this.props.className}`
    }

    let shieldClassName = 'dialog-box-shield'
    if (this.props.disableShieldExit) {
      shieldClassName += ' dialog-box-shield-unclickable'
    }

    return (
      <div className="dialog-box-container" ref={(ref) => { this.dialogEl = ref }}>
        <div className={shieldClassName} onClick={this.onClickShield} />
        <div className={className}>
          <button className="close" onClick={this.unmountDialog}>×</button>
          {this.props.children}
        </div>
      </div>
    )
  }
}

Dialog.propTypes = {
  dispatch: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  disableShieldExit: PropTypes.bool
}

Dialog.defaultProps = {
  className: '',
  disableShieldExit: false
}

export default connect()(Dialog)
