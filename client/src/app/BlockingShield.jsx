/**
 * It's kinda the same as BlockingError, but not
 *
 * Blocking shield is an overlay over the screen that prevents
 * interaction. At its most basic version it is fully transparent
 * and allows other UI to take priority (e.g. gallery). At other
 * times it can be "darkened" (creating a translucent overlay)
 * showing messages or errors.
 */
import React from 'react'
import { FormattedMessage } from 'react-intl'
import Button from '../ui/Button'
import { blockingCancel, blockingTryAgain } from '../util/fetch_blocking'
import { goReload } from './routing'
import './BlockingShield.scss'

const BLOCKING_SHIELD_DARKEN_DELAY = 800
const BLOCKING_SHIELD_TOO_SLOW_DELAY = 10000

export default class BlockingShield extends React.Component {
  constructor (props) {
    super(props)

    this.el = React.createRef()
    this.blockingShieldTimerId = -1
    this.blockingShieldTooSlowTimerId = -1

    this.state = {
      visible: false,
      mode: 'load',
      errorType: null,
      immediate: false,
      darken: false,
      showCancel: false
    }
  }

  /* TODO: move blocking shield state to Redux store */
  componentDidMount () {
    window.addEventListener(
      'stmx:show_blocking_shield',
      this.showBlockingShield
    )
    window.addEventListener(
      'stmx:darken_blocking_shield',
      this.darkenBlockingShield
    )
    window.addEventListener('stmx:hide_blocking_shield', this.hide)
  }

  componentWillUnmount () {
    window.removeEventListener(
      'stmx:show_blocking_shield',
      this.showBlockingShield
    )
    window.removeEventListener(
      'stmx:darken_blocking_shield',
      this.darkenBlockingShield
    )
    window.removeEventListener('stmx:hide_blocking_shield', this.hide)
  }

  clearTimers = () => {
    window.clearTimeout(this.blockingShieldTimerId)
    window.clearTimeout(this.blockingShieldTooSlowTimerId)
  }

  showBlockingShield = (event) => {
    this.clearTimers()

    this.setState({
      visible: true,

      // Internet Explorer and some other browsers may not support `event.detail`
      // See Sentry #STREETMIX-2MM
      //  https://sentry.io/share/issue/25aaf22cd58647b8b3402f77875fd5ee/
      mode: (event.detail && event.detail.mode) || 'load'
    })

    this.blockingShieldTimerId = window.setTimeout(() => {
      this.setState({ darken: true })
    }, BLOCKING_SHIELD_DARKEN_DELAY)

    this.blockingShieldTooSlowTimerId = window.setTimeout(() => {
      this.setState({ errorType: 'too-slow' })
    }, BLOCKING_SHIELD_TOO_SLOW_DELAY)
  }

  darkenBlockingShield = (event) => {
    this.clearTimers()

    this.setState({
      visible: true,
      immediate: true,
      errorType: 'try-again',
      showCancel: (event.detail && event.detail.showCancel) || true
    })
  }

  handleClickTryAgain = (event) => {
    this.setState({
      errorType: null,
      showCancel: false
    })

    blockingTryAgain()
  }

  handleClickCancel = (event) => {
    this.hide()

    blockingCancel()
  }

  hide = () => {
    this.clearTimers()

    this.setState({
      visible: false,
      errorType: null,
      immediate: false,
      darken: false,
      showCancel: false
    })
  }

  render () {
    const classNames = ['blocking-shield']

    if (!this.state.visible) {
      classNames.push('hidden')
    }
    if (this.state.immediate) {
      classNames.push('darken-immediately')
    }
    if (this.state.darken) {
      classNames.push('darken')
    }

    return (
      <div
        className={classNames.join(' ')}
        ref={this.el}
        hidden={!this.state.visible}
      >
        <h1>
          {this.state.mode === 'load' && (
            <FormattedMessage id="msg.loading" defaultMessage="Loading…" />
          )}
          {this.state.mode === 'remix' && (
            <FormattedMessage id="msg.remixing" defaultMessage="Remixing…" />
          )}
        </h1>
        {this.state.errorType === 'try-again' && (
          <div className="error-content">
            <p>
              <FormattedMessage
                id="msg.no-connection"
                defaultMessage="Streetmix is having trouble connecting to the Internet."
              />
            </p>
            <Button primary={true} onClick={this.handleClickTryAgain}>
              <FormattedMessage id="btn.try-again" defaultMessage="Try again" />
            </Button>
            {this.state.showCancel && (
              <Button onClick={this.handleClickCancel}>
                <FormattedMessage id="btn.cancel" defaultMessage="Cancel" />
              </Button>
            )}
          </div>
        )}
        {this.state.errorType === 'too-slow' && (
          <div className="error-content">
            <p>
              <FormattedMessage
                id="msg.slow-connection-1"
                defaultMessage="Streetmix wasn’t able to connect to the Internet in awhile now."
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
}
