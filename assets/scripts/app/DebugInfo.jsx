/**
 * DebugInfo.jsx
 *
 * Displays a debugging overlay that shows the current state of the application.
 *
 * @module DebugInfo
 * @requires keypress
 */
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { registerKeypress, deregisterKeypress } from './keypress'
import { loseAnyFocus } from '../util/focus'
import './DebugInfo.scss'

DebugInfo.propTypes = {
  settings: PropTypes.object,
  street: PropTypes.object,
  flags: PropTypes.object,
  undo: PropTypes.object,
  user: PropTypes.object
}

function DebugInfo (props) {
  const { settings = {}, street = {}, flags = {}, undo = {}, user = {} } = props
  const textareaEl = useRef(null)
  const [isVisible, setVisible] = useState(false)

  // Register keyboard input for show (shift-D)
  useEffect(() => {
    registerKeypress('shift d', showDebugInfo)
    return () => {
      deregisterKeypress('shift d', showDebugInfo)
    }
  })

  // Handle esc keybinding
  useEffect(() => {
    if (isVisible) {
      // Set up keypress listener to close debug window
      registerKeypress('esc', hideDebugInfo)
    } else {
      // Remove keypress listener
      deregisterKeypress('esc', hideDebugInfo)
    }

    // Clean up in case component is unmounted before hiding
    return () => {
      deregisterKeypress('esc', hideDebugInfo)
    }
  }, [isVisible])

  // Handle DOM effects when show / hide
  // useLayoutEffect helps with timing issues with DOM manipulation
  useLayoutEffect(() => {
    if (isVisible) {
      textareaEl.current.value = JSON.stringify({ street, user, settings, flags, undo }, null, 2)
      textareaEl.current.focus()
      textareaEl.current.select()
      // Prevent scrolling to bottom of textarea after select
      // NOTE: this is still not 100% deterministic, not sure why
      window.setTimeout(() => {
        textareaEl.current.scrollTop = 0
      }, 0)
    } else {
      loseAnyFocus()
    }
  }, [isVisible, settings, street, flags, undo, user])

  function showDebugInfo () {
    setVisible(true)
  }

  function hideDebugInfo () {
    setVisible(false)
  }

  let className = 'debug-info'

  if (isVisible === true) {
    className += ' debug-info-visible'
  }

  return (
    <div className={className}>
      <textarea readOnly wrap="off" ref={textareaEl} />
    </div>
  )
}

function mapStateToProps (state) {
  return {
    settings: state.settings,
    street: state.street,
    flags: state.flags,
    undo: state.undo,
    user: state.user
  }
}

export default connect(mapStateToProps)(DebugInfo)
