/**
 * Dialog (class)
 *
 * Generic class instance of menu
 *
 */
import React from 'react'
import ReactDOM from 'react-dom'

import { hideAllMenus } from '../menus/menu_old'
import { registerKeypress, deregisterKeypress } from '../app/keypress'

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
    ReactDOM.unmountComponentAtNode(this.dialogEl.parentNode)
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
