import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { nonblockingAjaxTryAgain } from '../util/fetch_nonblocking'
import { t } from '../app/locale'

const NO_CONNECTION_MESSAGE_TIMEOUT = 10000

class NoConnectionMessage extends React.Component {
  constructor (props) {
    super(props)

    this.timerId = -1
    this.state = {
      visible: false
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.scheduled === true) {
      if (this.timerId === -1) {
        this.timerId = window.setTimeout(() => {
          this.setState({
            visible: true
          })
        }, NO_CONNECTION_MESSAGE_TIMEOUT)
      }
    } else {
      window.clearTimeout(this.timerId)
      this.timerId = -1
      this.setState({
        visible: false
      })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    // When this is visible, this class on the body element repositions the
    // normal status message above this one so that they don't overlap
    if (this.state.visible) {
      document.body.classList.add('no-connection-message-visible')
    } else {
      document.body.classList.remove('no-connection-message-visible')
    }
  }

  render () {
    let className = 'status-message'

    if (this.state.visible === true) {
      className += ' visible'
    }

    return (
      <div className={className}>
        <div className="status-message-content">
          {t('msg.no-connection', 'Streetmix is having trouble connecting to the Internet.')}
          <button onClick={nonblockingAjaxTryAgain}>
            {t('btn.try-again', 'Try again')}
          </button>
        </div>
      </div>
    )
  }
}

NoConnectionMessage.propTypes = {
  scheduled: PropTypes.bool.isRequired
}

NoConnectionMessage.defaultProps = {
  scheduled: false
}

function mapStateToProps (state) {
  return {
    scheduled: state.status.noConnectionMessage
  }
}

export default connect(mapStateToProps)(NoConnectionMessage)
