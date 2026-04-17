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
import { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { CSSTransition } from 'react-transition-group'

import { CloseButton } from '../ui/CloseButton.js'
import { useOnClickOutside } from '../ui/useOnClickOutside.js'
import { clearDialogs } from '../store/slices/dialogs.js'
import { registerKeypress, deregisterKeypress } from '../app/keypress.js'
import './Dialog.css'

type CloseFunction = () => void
interface DialogProps {
  children: (arg: CloseFunction) => React.ReactElement
  ariaLabelledBy?: string
  ariaLabel?: string
}

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function Dialog({ children, ariaLabelledBy, ariaLabel }: DialogProps) {
  // Appear state controls transition in/out
  const dialogEl = useRef<HTMLDivElement>(null)
  const nodeRef = useRef(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
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
  function handleClose(): void {
    setAppear(false)
  }

  // When the animation is complete, then we clear dialog state
  function handleExit(): void {
    dispatch(clearDialogs())
  }

  useEffect(() => {
    const getFocusableElements = (): HTMLElement[] => {
      if (!dialogEl.current) return []

      return Array.from(
        dialogEl.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter((element) => {
        if (element.hasAttribute('disabled')) return false
        if (element.hasAttribute('hidden')) return false
        if (element.getAttribute('aria-hidden') === 'true') return false
        if (element.getAttribute('aria-disabled') === 'true') return false
        if (
          element instanceof HTMLInputElement &&
          element.getAttribute('type') === 'hidden'
        ) {
          return false
        }
        const computedStyles = window.getComputedStyle(element)
        if (
          computedStyles.display === 'none' ||
          computedStyles.visibility === 'hidden'
        ) {
          return false
        }
        return true
      })
    }

    const focusFirstElement = () => {
      const focusableElements = getFocusableElements()
      const firstElement = focusableElements[0] ?? dialogEl.current
      firstElement?.focus()
    }

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    focusFirstElement()

    const handleDialogTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !dialogEl.current) return

      const focusableElements = getFocusableElements()

      if (focusableElements.length === 0) {
        event.preventDefault()
        dialogEl.current.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      } else if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (
        activeElement instanceof Node &&
        !dialogEl.current.contains(activeElement)
      ) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleDialogTab)

    return () => {
      document.removeEventListener('keydown', handleDialogTab)

      if (
        previousActiveElementRef.current &&
        document.contains(previousActiveElementRef.current)
      ) {
        previousActiveElementRef.current.focus()
      } else {
        document.body.focus()
      }
    }
  }, [])

  return (
    <CSSTransition
      appear
      in={appear}
      timeout={80}
      classNames="dialog-transition"
      onExited={handleExit}
      nodeRef={nodeRef}
    >
      <div className="dialog-box-container" ref={nodeRef}>
        <div className="dialog-box-backdrop" />
        <div className="dialog-box-display-area">
          <div
            className="dialog-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
            aria-label={ariaLabel}
            tabIndex={-1}
            ref={dialogEl}
          >
            <CloseButton onClick={handleClose} />
            {children(handleClose)}
          </div>
        </div>
      </div>
    </CSSTransition>
  )
}
