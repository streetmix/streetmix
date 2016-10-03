/**
 * DebugInfo.jsx
 *
 * Displays a debugging overlay that shows the current state of the application.
 *
 * @module DebugInfo
 * @requires keypress
 */
import React from 'react'
import { cloneDeep } from 'lodash'
import { getStreet } from '../streets/data_model'
import { getUndoStack } from '../streets/undo_stack'
import { getSettings } from '../users/settings'
import { registerKeypress, deregisterKeypress } from './keypress'
import { loseAnyFocus } from './focus'

export default class DebugInfo extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      visible: false,
      content: ''
    }

    this.showDebugInfo = this.showDebugInfo.bind(this)
    this.hideDebugInfo = this.hideDebugInfo.bind(this)
  }

  componentDidMount () {
    // Register keyboard input for show (shift-D)
    registerKeypress('shift d', this.showDebugInfo)
  }

  getTextareaContent () {
    const debugStreetData = cloneDeep(getStreet())
    const debugUndo = cloneDeep(getUndoStack())
    const debugSettings = cloneDeep(getSettings())

    // Some things just shouldn't be seen...
    for (let i in debugStreetData.segments) {
      delete debugStreetData.segments[i].el
    }

    for (let j in debugUndo) {
      for (let k in debugUndo[j].segments) {
        delete debugUndo[j].segments[k].el
      }
    }

    // Create a JSON object, this parses better in editors
    const debugObj = {
      'DATA': debugStreetData,
      'SETTINGS': debugSettings,
      'UNDO': debugUndo
    }

    return JSON.stringify(debugObj, null, 2)
  }

  showDebugInfo () {
    this.setState({
      visible: true,
      content: this.getTextareaContent()
    })

    this.textareaEl.focus()
    this.textareaEl.select()

    // Prevent scrolling to bottom of textarea after select
    setTimeout(() => {
      this.textareaEl.scrollTop = 0
    }, 0)

    // Set up keypress listener to close debug window
    registerKeypress('esc', this.hideDebugInfo)
    // TODO: Register mouse inputs for hide
  }

  hideDebugInfo () {
    this.setState({
      visible: false,
      content: ''
    })

    loseAnyFocus()

    // Remove keypress listener
    deregisterKeypress('esc', this.hideDebugInfo)
  }

  render () {
    let className = 'debug-info'

    if (this.state.visible === true) {
      className += ' visible'
    }

    return (
      <div className={className} ref={(ref) => { this.containerEl = ref }}>
        <textarea value={this.state.content} readOnly ref={(ref) => { this.textareaEl = ref }} />
      </div>
    )
  }
}
