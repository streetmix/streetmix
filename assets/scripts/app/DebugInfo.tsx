import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { useSelector } from '../store/hooks'
import { loseAnyFocus } from '../util/focus'
import { useOnClickOutside } from '../ui/useOnClickOutside'
import './DebugInfo.scss'

function DebugInfo (): React.ReactElement | null {
  const panelEl = useRef<HTMLDivElement>(null)
  const textareaEl = useRef<HTMLTextAreaElement>(null)
  const [isVisible, setVisible] = useState(false)
  const settings = useSelector((state) => state.settings)
  const street = useSelector((state) => state.street)
  const flags = useSelector((state) => state.flags)
  const history = useSelector((state) => state.history)
  const user = useSelector((state) => state.user)

  // Register keyboard input for show (shift-D)
  useEffect(() => {
    window.addEventListener('keydown', showDebugInfo)
    return () => {
      window.removeEventListener('keydown', showDebugInfo)
    }
  })

  // Handle esc keybinding
  // This appears to be used because there is a problem with registerKeypress()
  useEffect(() => {
    if (isVisible) {
      // Set up keypress listener to close debug window
      window.addEventListener('keydown', hideDebugInfo)
    } else {
      // Remove keypress listener
      window.removeEventListener('keydown', hideDebugInfo)
    }

    // Clean up in case component is unmounted before hiding
    return () => {
      window.removeEventListener('keydown', hideDebugInfo)
    }
  }, [isVisible])

  // Handle DOM effects when show / hide
  // useLayoutEffect helps with timing issues with DOM manipulation
  useLayoutEffect(() => {
    if (textareaEl.current === null) return

    if (isVisible) {
      textareaEl.current.value = JSON.stringify(
        { street, user, settings, flags, history },
        null,
        2
      )
      textareaEl.current.focus()
      textareaEl.current.select()
      // Prevent scrolling to bottom of textarea after select
      // NOTE: this is still not 100% deterministic, not sure why
      window.setTimeout(() => {
        if (textareaEl.current) {
          textareaEl.current.scrollTop = 0
        }
      }, 0)
    }
  }, [isVisible, settings, street, flags, history, user])

  // This should only be called when the debug window becomes invisible.
  // This will also be called once during component initialization, that
  // __should__ be okay.
  useLayoutEffect(() => {
    if (!isVisible) {
      // This is a very aggressive focus puller. Don't ever call this in
      // an effect that has other dependencies!
      loseAnyFocus()
    }
  }, [isVisible])

  // Set up handler to close dialogs when clicking outside of it
  useOnClickOutside(panelEl, () => {
    setVisible(false)
  })

  function showDebugInfo (event: KeyboardEvent): void {
    const el = event.target as HTMLElement

    // Do not display debug info when the key combo is pressed inside of an input element
    if (event.key === 'D' && !/input|textarea/i.test(el?.tagName)) {
      setVisible(true)
    }
  }

  function hideDebugInfo (event: KeyboardEvent): void {
    if (event.key === 'Esc' || event.key === 'Escape') {
      setVisible(false)
    }
  }

  if (isVisible) {
    return (
      <div className="debug-container">
        <div className="debug-panel" ref={panelEl}>
          <h2>Debug</h2>
          <textarea readOnly={true} wrap="off" ref={textareaEl} />
        </div>
      </div>
    )
  }

  // Don't render any DOM if invisible
  return null
}

export default DebugInfo
