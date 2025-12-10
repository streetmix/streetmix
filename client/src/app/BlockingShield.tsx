/**
 * It's kinda the same as BlockingError, but not
 *
 * Blocking shield is an overlay over the screen that prevents interaction.
 * At its most basic version it is fully transparent and allows other UI to
 * take priority (e.g. gallery). At other times it can be "darkened" (creating
 * a translucent overlay) showing messages or errors.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FormattedMessage } from 'react-intl'

import Button from '../ui/Button.js'
import { blockingCancel, blockingTryAgain } from '../util/fetch_blocking.js'
import { goReload } from './routing.js'

import './BlockingShield.css'

const BLOCKING_SHIELD_DARKEN_DELAY = 800
const BLOCKING_SHIELD_TOO_SLOW_DELAY = 10000

export default function BlockingShield() {
  const el = useRef(null)
  const blockingShieldTimerIdRef = useRef(-1)
  const blockingShieldTooSlowTimerIdRef = useRef(-1)

  const [visible, setVisible] = useState(false)
  const [mode, setMode] = useState('load')
  const [errorType, setErrorType] = useState<string>()
  const [immediate, setImmediate] = useState(false)
  const [darken, setDarken] = useState(false)
  const [showCancel, setShowCancel] = useState(false)

  const clearTimers = useCallback(() => {
    window.clearTimeout(blockingShieldTimerIdRef.current)
    window.clearTimeout(blockingShieldTooSlowTimerIdRef.current)
  }, [])

  const hide = useCallback(() => {
    clearTimers()

    setVisible(false)
    setErrorType(undefined)
    setImmediate(false)
    setDarken(false)
    setShowCancel(false)
  }, [clearTimers])

  const showBlockingShield = useCallback(
    (event: CustomEventInit<{ mode: string }>) => {
      clearTimers()

      setVisible(true)
      setMode(event.detail?.mode ?? 'load')

      blockingShieldTimerIdRef.current = window.setTimeout(() => {
        setDarken(true)
      }, BLOCKING_SHIELD_DARKEN_DELAY)

      blockingShieldTooSlowTimerIdRef.current = window.setTimeout(() => {
        setErrorType('too-slow')
      }, BLOCKING_SHIELD_TOO_SLOW_DELAY)
    },
    [clearTimers]
  )

  const darkenBlockingShield = useCallback(
    (event: CustomEventInit<{ showCancel: boolean }>) => {
      clearTimers()

      setVisible(true)
      setImmediate(true)
      setErrorType('try-again')
      setShowCancel(event.detail?.showCancel ?? true)
    },
    [clearTimers]
  )

  const handleClickTryAgain = useCallback((_event: React.MouseEvent) => {
    setErrorType(undefined)
    setShowCancel(false)

    blockingTryAgain()
  }, [])

  const handleClickCancel = useCallback(
    (_event: React.MouseEvent) => {
      hide()

      blockingCancel()
    },
    [hide]
  )

  /* TODO: move blocking shield state to Redux store */
  useEffect(() => {
    window.addEventListener('stmx:show_blocking_shield', showBlockingShield)
    window.addEventListener('stmx:darken_blocking_shield', darkenBlockingShield)
    window.addEventListener('stmx:hide_blocking_shield', hide)

    return () => {
      window.removeEventListener(
        'stmx:show_blocking_shield',
        showBlockingShield
      )
      window.removeEventListener(
        'stmx:darken_blocking_shield',
        darkenBlockingShield
      )
      window.removeEventListener('stmx:hide_blocking_shield', hide)
      clearTimers()
    }
  }, [showBlockingShield, darkenBlockingShield, hide, clearTimers])

  const classNames = ['blocking-shield']

  if (!visible) {
    classNames.push('hidden')
  }
  if (immediate) {
    classNames.push('darken-immediately')
  }
  if (darken) {
    classNames.push('darken')
  }

  return (
    <div className={classNames.join(' ')} ref={el} hidden={!visible}>
      <h1>
        {mode === 'load' && (
          <FormattedMessage id="msg.loading" defaultMessage="Loading…" />
        )}
        {mode === 'remix' && (
          <FormattedMessage id="msg.remixing" defaultMessage="Remixing…" />
        )}
      </h1>
      {errorType === 'try-again' && (
        <div className="error-content">
          <p>
            <FormattedMessage
              id="msg.no-connection"
              defaultMessage="Streetmix is having trouble connecting to the Internet."
            />
          </p>
          <Button primary onClick={handleClickTryAgain}>
            <FormattedMessage id="btn.try-again" defaultMessage="Try again" />
          </Button>
          {showCancel && (
            <Button onClick={handleClickCancel}>
              <FormattedMessage id="btn.cancel" defaultMessage="Cancel" />
            </Button>
          )}
        </div>
      )}
      {errorType === 'too-slow' && (
        <div className="error-content">
          <p>
            <FormattedMessage
              id="msg.slow-connection-1"
              defaultMessage="Streetmix wasn't able to connect to the Internet in awhile now."
            />
          </p>
          <p>
            <FormattedMessage
              id="msg.slow-connection-2"
              defaultMessage="You might want to reload the page and try again. Please note
                  you might lose the latest change to the street. Sorry!"
            />
          </p>
          <Button onClick={goReload}>
            <FormattedMessage id="btn.reload" defaultMessage="Reload" />
          </Button>
        </div>
      )}
    </div>
  )
}
