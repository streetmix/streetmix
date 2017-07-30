import React from 'react'

export default class NoConnectionMessage extends React.PureComponent {
  render () {
    return (
      <div id='no-connection-message' className='status-message'>
        <div className='status-message-content'>
          Streetmix is having trouble connecting to the Internet.
          <button id='no-connection-try-again'>Try again</button>
        </div>
      </div>
    )
  }
}
