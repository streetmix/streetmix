/**
 * Dialog (class)
 *
 * Generic class instance of dialog
 *
 */
import React from 'react'
import { hideAllMenus } from '../menus/menu_controller'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import store from '../store'
import { CLEAR_DIALOGS } from '../store/actions'

export default class Dialog extends React.Component {
  constructor (props) {
    super(props)

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
    store.dispatch({ type: CLEAR_DIALOGS })
  }

  render () {
    let className = 'dialog-box'
    if (this.props.className !== undefined) {
      className += ` ${this.props.className}`
    }

    return (
      <div className='dialog-box-container' ref={(ref) => { this.dialogEl = ref }}>
        <div className='dialog-box-shield' onClick={this.unmountDialog} />
        <div className={className}>
          <button className='close' onClick={this.unmountDialog}>×</button>
          {this.props.children}
        </div>
      </div>
    )
  }
}

Dialog.propTypes = {
  className: React.PropTypes.string,
  children: React.PropTypes.node
}
