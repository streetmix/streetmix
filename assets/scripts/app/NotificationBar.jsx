import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { Transition } from 'react-transition-group'
import { FormattedMessage } from 'react-intl'
import CloseButton from '../ui/CloseButton'
import './NotificationBar.scss'

const TRANSITION_DURATION = 250
const TRANSITION_BASE_STYLE = {
  transition: `margin ${TRANSITION_DURATION}ms ease-out`
}

// const LSKEY_NOTIFICATION_TOS = 'notification-tos-dismissed'
const LSKEY_NOTIFICATION_STORE = 'notification-store-dismissed'

const NotificationBar = ({ notification = {} }) => {
  const {
    display = false,
    lede,
    text,
    link,
    linkText
  } = notification

  let shouldDisplay = display

  // If dismissed, don't display again.
  if (window.localStorage[LSKEY_NOTIFICATION_STORE]) {
    shouldDisplay = !JSON.parse(window.localStorage[LSKEY_NOTIFICATION_STORE])
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
      window.localStorage[LSKEY_NOTIFICATION_STORE] = JSON.stringify(true)
    } catch (error) {
      // Cannot modify localstorage.
    }
  }

  // If no one turns this on explicitly, don't display anything
  if (!display || (!lede && !text && !link)) return null

  // If locale isn't English, don't display; we don't localize these messages
  // if (this.props.locale !== 'en') return null
  // For now disabled so that TOS/Privacy policy notice displays worldwide.

  return (
    <Transition in={show} timeout={TRANSITION_DURATION} onExited={handleExited} unmountOnExit>
      <div
        className="notification-bar"
        ref={el}
        style={{
          ...TRANSITION_BASE_STYLE,
          marginTop: `-${height}px`
        }}
      >
        {lede && <strong className="notification-bar-intro">{lede}</strong>}
        {text && <span className="notification-bar-text">{text}</span>}
        {
          link &&
            <a href={link} target="_blank" rel="noopener noreferrer" className="notification-bar-link">
              {linkText || <FormattedMessage id="msg.more-info" defaultMessage="More info" />}
            </a>
        }
        <CloseButton onClick={handleClickDismiss} />
      </div>
    </Transition>
  )
}

NotificationBar.propTypes = {
  // locale: PropTypes.string,
  notification: PropTypes.shape({
    display: PropTypes.bool,
    lede: PropTypes.string,
    text: PropTypes.string,
    link: PropTypes.string,
    linkText: PropTypes.string
  })
}

export default NotificationBar
