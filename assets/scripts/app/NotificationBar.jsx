import React from 'react'
import PropTypes from 'prop-types'
import { Transition } from 'react-transition-group'
import { FormattedMessage } from 'react-intl'
import CloseButton from '../ui/CloseButton'
import './NotificationBar.scss'

const TRANSITION_DURATION = 250
const TRANSITION_BASE_STYLE = {
  transition: `margin ${TRANSITION_DURATION}ms ease-out`
}

const LSKEY_NOTIFICATION_TOS = 'notification-tos-dismissed'

export default class NotificationBar extends React.Component {
  static propTypes = {
    // locale: PropTypes.string,
    notification: PropTypes.shape({
      display: PropTypes.bool,
      lede: PropTypes.string,
      text: PropTypes.string,
      link: PropTypes.string,
      linkText: PropTypes.string
    })
  }

  static defaultProps = {
    notification: {
      display: false
    }
  }

  constructor (props) {
    super(props)

    let shouldDisplay = props.notification.display

    // If dismissed, don't display again.
    if (window.localStorage[LSKEY_NOTIFICATION_TOS]) {
      shouldDisplay = !JSON.parse(window.localStorage[LSKEY_NOTIFICATION_TOS])
    }

    this.state = {
      height: 0,
      in: shouldDisplay
    }

    this.el = React.createRef()
  }

  handleClickDismiss = (event) => {
    const height = this.el.current.getBoundingClientRect().height

    this.setState({
      height,
      in: false
    })
  }

  handleExited = () => {
    try {
      window.localStorage[LSKEY_NOTIFICATION_TOS] = JSON.stringify(true)
    } catch (error) {
      // Cannot modify localstorage.
    }
  }

  render () {
    const { display, lede, text, link, linkText } = this.props.notification

    // If no one turns this on explicitly, don't display anything
    if (!display || (!lede && !text && !link)) return null

    // If locale isn't English, don't display; we don't localize these messages
    // if (this.props.locale !== 'en') return null
    // For now disabled so that TOS/Privacy policy notice displays worldwide.

    return (
      <Transition in={this.state.in} timeout={TRANSITION_DURATION} onExited={this.handleExited} unmountOnExit>
        <div
          className="notification-bar"
          ref={this.el}
          style={{
            ...TRANSITION_BASE_STYLE,
            marginTop: `-${this.state.height}px`
          }}
        >
          {lede && <strong className="notification-bar-intro">{lede}</strong>}
          {text && <span className="notification-bar-text">{text}</span>}
          {link &&
            <a href={link} target="_blank" rel="noopener noreferrer" className="notification-bar-link">
              {linkText || <FormattedMessage id="msg.more-info" defaultMessage="More info" />}
            </a>
          }
          <CloseButton onClick={this.handleClickDismiss} />
        </div>
      </Transition>
    )
  }
}
