/**
 * Dialog
 *
 * These things are actually modals, since they block the main window.
 * They're positioned over everything else in the app and will prevent
 * interaction with the rest of the app until it's closed.
 *
 * Clicking on the modal's backdrop will automatically close the modal.
 * We used to have dialogs that prevented this form of closing, but
 * they're not used anymore, so this functionality has been removed.
 * Modals that behave differently from each other is probably not a
 * great idea.
 *
 * Only one modal window is shown at a time. Nested modals aren't supported.
 */
import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import CloseButton from '../ui/CloseButton'
import { useOnClickOutside } from '../ui/useOnClickOutside'
import { clearDialogs } from '../store/slices/dialogs'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import './Dialog.scss'

Dialog.propTypes = {
  children: PropTypes.func.isRequired
}

function Dialog ({ children }) {
  // Appear state controls transition in/out
  const dialogEl = useRef(null)
  const [appear, setAppear] = useState(true)
  const dispatch = useDispatch()

  // Set up handler to close dialogs when clicking outside of it
  useOnClickOutside(dialogEl, handleClose)

  // Set up keypress listener to close dialogs if open
  useEffect(() => {
    registerKeypress('esc', handleClose)

    return () => {
      deregisterKeypress('esc', handleClose)
    }
  }, [])

  // On "close", we animate the dialog out
  function handleClose () {
    setAppear(false)
  }

  // When the animation is complete, then we clear dialog state
  function handleExit () {
    dispatch(clearDialogs())
  }

  return (
    <CSSTransition
      appear={true}
      in={appear}
      timeout={80}
      classNames="dialog-transition"
      onExited={handleExit}
    >
      <div className="dialog-box-container">
        <div className="dialog-box-backdrop" />
        <div className="dialog-box" role="dialog" ref={dialogEl}>
          <CloseButton onClick={handleClose} />
          {children(handleClose)}
        </div>
      </div>
    </CSSTransition>
  )
}

export default Dialog
