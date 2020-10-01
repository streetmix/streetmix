import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { Transition } from 'react-transition-group'
import { FormattedMessage } from 'react-intl'
import CloseButton from '../ui/CloseButton'
import ExternalLink from '../ui/ExternalLink'
import './NotificationBar.scss'

const TRANSITION_DURATION = 250
const TRANSITION_BASE_STYLE = {
  transition: `margin ${TRANSITION_DURATION}ms ease-out`
}

// Past notification localstorage keys
// const LSKEY_NOTIFICATION_TOS = 'notification-tos-dismissed'
// const LSKEY_NOTIFICATION_STORE = 'notification-store-dismissed'

NotificationBar.propTypes = {
  notification: PropTypes.shape({
    display: PropTypes.bool,
    lede: PropTypes.string,
    text: PropTypes.string,
    link: PropTypes.string,
    linkText: PropTypes.string,
    localStorageKey: PropTypes.string
  })
}

function NotificationBar ({ notification = {} }) {
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
  if (window.localStorage[localStorageKey]) {
    shouldDisplay = !JSON.parse(window.localStorage[localStorageKey])
  }

  const [show, setShow] = useState(shouldDisplay)
  const [height, setHeight] = useState(0)
  const el = useRef(null)

  const handleClickDismiss = (event) => {
    const height = el.current.getBoundingClientRect().height

    setHeight(height)
    setShow(false)
  }

  const handleExited = () => {
    try {
      if (localStorageKey) {
        window.localStorage[localStorageKey] = JSON.stringify(true)
      }
    } catch (error) {
      // Cannot modify localstorage.
    }
  }

  // If no one turns this on explicitly, don't display anything
  if (!display || (!lede && !text && !link)) return null

  // If locale isn't English, don't display; we don't localize these messages
  if (locale.locale !== 'en') return null

  return (
    <Transition
      in={show}
      timeout={TRANSITION_DURATION}
      onExited={handleExited}
      unmountOnExit={true}
    >
      <div
        className="notification-bar"
        ref={el}
        style={{
          ...TRANSITION_BASE_STYLE,
          marginTop: `-${height}px`
        }}
      >
        {lede && (
          <>
            <strong className="notification-bar-intro">{lede}</strong>{' '}
          </>
        )}
        {text && (
          <>
            <span className="notification-bar-text">{text}</span>{' '}
          </>
        )}
        {link && (
          <ExternalLink href={link} className="notification-bar-link">
            {linkText || (
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
