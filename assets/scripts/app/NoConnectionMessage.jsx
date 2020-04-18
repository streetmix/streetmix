import React, { useRef, useLayoutEffect } from 'react'
import { useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { nonblockingAjaxTryAgain } from '../util/fetch_nonblocking'
import './StatusMessage.scss'

const NO_CONNECTION_MESSAGE_TIMEOUT = 10000

function NoConnectionMessage (props) {
  const scheduled = useSelector(
    (state) => state.status.noConnectionMessage ?? false
  )
  const el = useRef(null)
  const timerId = useRef(-1)

  function cleanup () {
    window.clearTimeout(timerId.current)
    timerId.current = -1

    el.current.classList.remove('status-message-visible')

    // Do not allow keyboard focus on the button when offscreen
    el.current.querySelector('button').setAttribute('tabindex', '-1')
  }

  useLayoutEffect(() => {
    if (scheduled && timerId.current === -1) {
      timerId.current = window.setTimeout(() => {
        el.current.classList.add('status-message-visible')

        // Allow keyboard focus on the button when visible
        el.current.querySelector('button').setAttribute('tabindex', '0')
      }, NO_CONNECTION_MESSAGE_TIMEOUT)
    } else {
      cleanup()
    }

    return () => {
      cleanup()
    }
  })

  return (
    <div className="status-message" ref={el}>
      <div className="status-message-content">
        <FormattedMessage
          id="msg.no-connection"
          defaultMessage="Streetmix is having trouble connecting to the Internet."
        />
        <button onClick={nonblockingAjaxTryAgain} tabIndex="-1">
          <FormattedMessage id="btn.try-again" defaultMessage="Try again" />
        </button>
      </div>
    </div>
  )
}

export default NoConnectionMessage
