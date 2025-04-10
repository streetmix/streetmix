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
import { useDispatch } from 'react-redux'
import { CSSTransition } from 'react-transition-group'

import CloseButton from '../ui/CloseButton'
import { useOnClickOutside } from '../ui/useOnClickOutside'
import { clearDialogs } from '../store/slices/dialogs'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import './Dialog.css'

type CloseFunction = () => void
interface DialogProps {
  children: (arg: CloseFunction) => React.ReactElement
}

function Dialog ({ children }: DialogProps): React.ReactElement {
  // Appear state controls transition in/out
  const dialogEl = useRef<HTMLDivElement>(null)
  const nodeRef = useRef(null)
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
  function handleClose (): void {
    setAppear(false)
  }

  // When the animation is complete, then we clear dialog state
  function handleExit (): void {
    dispatch(clearDialogs())
  }

  return (
    <CSSTransition
      appear={true}
      in={appear}
      timeout={80}
      classNames="dialog-transition"
      onExited={handleExit}
      nodeRef={nodeRef}
    >
      <div className="dialog-box-container" ref={nodeRef}>
        <div className="dialog-box-backdrop" />
        <div className="dialog-box-display-area">
          <div className="dialog-box" role="dialog" ref={dialogEl}>
            <CloseButton onClick={handleClose} />
            {children(handleClose)}
          </div>
        </div>
      </div>
    </CSSTransition>
  )
}

export default Dialog
