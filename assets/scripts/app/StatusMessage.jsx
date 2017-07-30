import React from 'react'

export default class StatusMessage extends React.PureComponent {
  render () {
    return (
      <div id='status-message' className='status-message'>
        <div className='status-message-content' />
      </div>
    )
  }
}
