import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { nonblockingAjaxTryAgain } from '../util/fetch_nonblocking'
import { t } from '../app/locale'

class NoConnectionMessage extends React.PureComponent {
  render () {
    let className = 'status-message'

    if (this.props.visible === true) {
      className += ' visible'
    }

    return (
      <div className={className}>
        <div className='status-message-content'>
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
  visible: PropTypes.bool.isRequired
}

function mapStateToProps (state) {
  return {
    visible: state.status.noConnectionMessage
  }
}

export default connect(mapStateToProps)(NoConnectionMessage)
