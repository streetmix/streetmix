import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { nonblockingAjaxTryAgain } from '../util/fetch_nonblocking'

const NO_CONNECTION_MESSAGE_TIMEOUT = 10000

export class NoConnectionMessage extends React.Component {
  static propTypes = {
    scheduled: PropTypes.bool.isRequired
  }

  static defaultProps = {
    scheduled: false
  }

  constructor (props) {
    super(props)

    this.el = React.createRef()
    this.timerId = -1
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.scheduled && this.timerId === -1) {
      this.timerId = window.setTimeout(() => {
        this.el.current.classList.add('status-message-visible')
        console.log(this.el.current)
        // When this is visible, this class on the body element repositions the
        // normal status message above this one so that they don't overlap
        document.body.classList.add('no-connection-message-visible')
      }, NO_CONNECTION_MESSAGE_TIMEOUT)
    } else {
      window.clearTimeout(this.timerId)
      this.timerId = -1

      this.el.current.classList.remove('status-message-visible')
      document.body.classList.remove('no-connection-message-visible')
    }
  }

  render () {
    return (
      <div className="status-message" ref={this.el}>
        <div className="status-message-content">
          <FormattedMessage id="msg.no-connection" defaultMessage="Streetmix is having trouble connecting to the Internet." />
          <button onClick={nonblockingAjaxTryAgain}>
            <FormattedMessage id="btn.try-again" defaultMessage="Try again" />
          </button>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    scheduled: state.status.noConnectionMessage
  }
}

export default connect(mapStateToProps)(NoConnectionMessage)
