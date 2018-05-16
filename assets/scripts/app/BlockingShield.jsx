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
import { goReload } from './routing'
import { blockingCancel, blockingTryAgain } from '../util/fetch_blocking'

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
      darken: false,
      showCancel: false
    }
  }

  componentDidMount () {
    window.addEventListener('stmx:show_blocking_shield', (event) => {
      this.setState({
        visible: true,
        mode: event.detail.mode || 'load'
      })

      this.blockingShieldTimerId = window.setTimeout(() => {
        this.setState({ darken: true })
      }, BLOCKING_SHIELD_DARKEN_DELAY)

      this.blockingShieldTooSlowTimerId = window.setTimeout(() => {
        this.setState({ errorType: 'too-slow' })
      }, BLOCKING_SHIELD_TOO_SLOW_DELAY)
    })

    window.addEventListener('stmx:darken_blocking_shield', (event) => {
      this.setState({
        visible: true,
        immediate: true,
        errorType: 'try-again',
        showCancel: event.detail.showCancel
      })
    })

    window.addEventListener('stmx:hide_blocking_shield', (event) => {
      this.setState({
        visible: false,
        immediate: false,
        errorType: null,
        showCancel: false
      })
    })
  }

  componentDidUpdate (prevProps, prevState) {
    this.clearTimers()
  }

  clearTimers = () => {
    window.clearTimeout(this.blockingShieldTimerId)
    window.clearTimeout(this.blockingShieldTooSlowTimerId)
  }

  blockingTryAgain = (event) => {
    this.setState({
      errorType: null,
      showCancel: false
    })

    blockingTryAgain()
  }

  render () {
    const classNames = ['blocking-shield']

    if (this.state.visible) {
      classNames.push('visible')
    }
    if (this.state.immediate) {
      classNames.push('darken-immediately')
    }
    if (this.state.darken) {
      classNames.push('darken')
    }

    return (
      <div className={classNames.join(' ')} ref={this.el}>
        <div className="message">
          {(this.state.mode === 'load') && <FormattedMessage id="msg.loading" defaultMessage="Loading…" />}
          {(this.state.mode === 'remix') && <FormattedMessage id="msg.remixing" defaultMessage="Remixing…" />}
        </div>
        {(this.state.errorType === 'try-again') &&
          <div className="blocking-shield-content">
            <FormattedMessage id="msg.no-connection" defaultMessage="Streetmix is having trouble connecting to the Internet." />
            <br />
            <button onClick={this.blockingTryAgain}>
              <FormattedMessage id="btn.try-again" defaultMessage="Try again" />
            </button>
            {this.state.showCancel &&
              <button onClick={blockingCancel}>
                <FormattedMessage id="btn.cancel" defaultMessage="Cancel" />
              </button>
            }
          </div>
        }
        {(this.state.errorType === 'too-slow') &&
          <div className="blocking-shield-content">
            <FormattedMessage id="msg.slow-connection-1" defaultMessage="Streetmix wasn’t able to connect to the Internet in awhile now." />
            <br /><br />
            <FormattedMessage id="msg.slow-connection-2" defaultMessage="You might want to reload the page and try again. Please note you might lose the latest change to the street. Sorry!" />
            <br /><br />
            <button onClick={goReload}>
              <FormattedMessage id="btn.reload" defaultMessage="Reload" />
            </button>
          </div>
        }
      </div>
    )
  }
}
