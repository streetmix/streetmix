/**
 * Dialog (class)
 *
 * Generic class instance of dialog
 *
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import { clearDialogs } from '../store/actions/dialogs'

class Dialog extends React.PureComponent {
  static propTypes = {
    clearDialogs: PropTypes.func.isRequired,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
    disableShieldExit: PropTypes.bool
  }

  static defaultProps = {
    className: '',
    disableShieldExit: false
  }

  componentDidMount () {
    // Set up keypress listener to close dialogs if open
    registerKeypress('esc', this.unmountDialog)
  }

  componentWillUnmount () {
    deregisterKeypress('esc', this.unmountDialog)
  }

  unmountDialog = () => {
    this.props.clearDialogs()
  }

  onClickShield = () => {
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

function mapDispatchToProps (dispatch) {
  return {
    clearDialogs: () => { dispatch(clearDialogs()) }
  }
}

export default connect(null, mapDispatchToProps)(Dialog)
