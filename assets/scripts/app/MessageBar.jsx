import React from 'react'

export default class MessageBar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      visible: true
    }
  }

  onClickDismiss = (event) => {
    this.setState({
      visible: false
    })
  }

  render () {
    if (!this.state.visible) return null

    return (
      <div className="message-bar">
        <strong className="message-bar-intro">Help defend net neutrality!</strong>
        <span className="message-bar-text">Projects like Streetmix couldn’t exist without Internet freedom.</span>
        <a href="https://www.battleforthenet.com/" target="_blank" className="message-bar-link">Learn more.</a>
        <button className="close" onClick={this.onClickDismiss} title="Dismiss">×</button>
      </div>
    )
  }
}
