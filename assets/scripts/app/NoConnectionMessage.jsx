import React from 'react'
import { nonblockingAjaxTryAgain } from '../util/fetch_nonblocking'

export default class NoConnectionMessage extends React.PureComponent {
  render () {
    return (
      <div id='no-connection-message' className='status-message'>
        <div className='status-message-content'>
          Streetmix is having trouble connecting to the Internet.
          <button onClick={nonblockingAjaxTryAgain}>Try again</button>
        </div>
      </div>
    )
  }
}
