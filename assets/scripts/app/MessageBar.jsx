import React from 'react'
import { Transition } from 'react-transition-group'
import { t } from '../app/locale'

const TRANSITION_DURATION = 250
const TRANSITION_BASE_STYLE = {
  transition: `margin ${TRANSITION_DURATION}ms ease-out`
}

export default class MessageBar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      visible: true,
      height: 0
    }

    this.el = null
  }

  onClickDismiss = (event) => {
    const height = this.el.getBoundingClientRect().height

    this.setState({
      visible: false,
      height
    })
  }

  render () {
    // No messages to display for now, so return null from this component.
    // For now, manually edit this render and deploy for messages.
    return null

    /* eslint-disable no-unreachable */
    const margin = (this.state.visible) ? 0 : `-${this.state.height}px`

    return (
      <Transition in={this.state.visible} timeout={TRANSITION_DURATION} unmountOnExit>
        <div className="message-bar" ref={(ref) => { this.el = ref }} style={{ ...TRANSITION_BASE_STYLE, marginTop: margin }}>
          <strong className="message-bar-intro">Heads up!</strong>
          <span className="message-bar-text">Streetmix will be offline for maintainance on January 1, 2018 at 19:00 GMT.</span>
          <a href="https://twitter.com/streetmix/" target="_blank" rel="noopener" className="message-bar-link">Follow us on Twitter for updates.</a>
          <button className="close" onClick={this.onClickDismiss} title={t('btn.dismiss', 'Dismiss')}>×</button>
        </div>
      </Transition>
    )
  }
}
