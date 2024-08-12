import React, { useState, useRef } from 'react'
import { Transition } from 'react-transition-group'
import { FormattedMessage } from 'react-intl'

import { useSelector } from '~/src/store/hooks'
import CloseButton from '~/src/ui/CloseButton'
import ExternalLink from '~/src/ui/ExternalLink'
import './NotificationBar.css'

const TRANSITION_DURATION = 250
const TRANSITION_BASE_STYLE = {
  transition: `margin ${TRANSITION_DURATION}ms ease-out`
}

// Past notification localstorage keys
// const LSKEY_NOTIFICATION_TOS = 'notification-tos-dismissed'
// const LSKEY_NOTIFICATION_STORE = 'notification-store-dismissed'

interface NotificationConfig {
  display?: boolean
  lede?: string
  text?: string
  link?: string
  linkText?: string
  localStorageKey?: string
}

interface NotificationBarProps {
  notification?: NotificationConfig
}

// NOTE: Notification is passed in as a prop, rather than directly imported
// from notification.json in this file, in order to make it easier to test.
function NotificationBar ({
  notification = {}
}: NotificationBarProps): React.ReactElement | null {
  const locale = useSelector((state) => state.locale)
  const {
    display = false,
    lede,
    text,
    link,
    linkText,
    localStorageKey
  } = notification

  let shouldDisplay = display

  // If dismissed, don't display again.
  if (
    localStorageKey !== undefined &&
    JSON.parse(window.localStorage.getItem(localStorageKey) ?? '') === true
  ) {
    shouldDisplay = false
  }

  const [show, setShow] = useState(shouldDisplay)
  const [height, setHeight] = useState(0)
  const el = useRef<HTMLDivElement>(null)

  const handleClickDismiss = (): void => {
    if (el.current === null) return

    const height = el.current.getBoundingClientRect().height

    setHeight(height)
    setShow(false)
  }

  const handleExited = (): void => {
    try {
      if (localStorageKey !== undefined) {
        window.localStorage[localStorageKey] = JSON.stringify(true)
      }
    } catch (error) {
      // Cannot modify localstorage.
    }
  }

  // If no one turns this on explicitly, don't display anything
  if (
    !display ||
    (lede === undefined && text === undefined && link === undefined)
  ) {
    return null
  }

  // If locale isn't English, don't display; we don't localize these messages
  if (locale.locale !== 'en') return null

  return (
    <Transition
      in={show}
      timeout={TRANSITION_DURATION}
      onExited={handleExited}
      unmountOnExit={true}
      nodeRef={el}
    >
      <div
        className="notification-bar"
        ref={el}
        style={{
          ...TRANSITION_BASE_STYLE,
          marginTop: `-${height}px`
        }}
      >
        {lede !== undefined && (
          <>
            <strong className="notification-bar-intro">{lede}</strong>{' '}
          </>
        )}
        {text !== undefined && (
          <>
            <span className="notification-bar-text">{text}</span>{' '}
          </>
        )}
        {link !== undefined && (
          <ExternalLink href={link} className="notification-bar-link">
            {linkText ?? (
              <FormattedMessage id="msg.more-info" defaultMessage="More info" />
            )}
          </ExternalLink>
        )}
        <CloseButton onClick={handleClickDismiss} />
      </div>
    </Transition>
  )
}

export default NotificationBar
