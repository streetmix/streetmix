import React from 'react'
import PropTypes from 'prop-types'
import { Transition } from 'react-transition-group'
import { FormattedMessage } from 'react-intl'
import CloseButton from '../ui/CloseButton'

const TRANSITION_DURATION = 250
const TRANSITION_BASE_STYLE = {
  transition: `margin ${TRANSITION_DURATION}ms ease-out`
}

class MessageBar extends React.Component {
  static propTypes = {
    message: PropTypes.shape({
      display: PropTypes.bool,
      lede: PropTypes.string,
      text: PropTypes.string,
      link: PropTypes.string,
      linkText: PropTypes.string
    })
  }

  static defaultProps = {
    message: {
      display: false
    }
  }

  constructor (props) {
    super(props)

    this.state = {
      height: 0
    }

    this.el = React.createRef()
  }

  onClickDismiss = (event) => {
    const height = this.el.current.getBoundingClientRect().height

    this.setState({
      height
    })
  }

  render () {
    const { display, lede, text, link, linkText } = this.props.message

    // If no one turns this on explicitly, don't display anything
    if (!display || (!lede && !text && !link)) return null

    return (
      <Transition in={display} timeout={TRANSITION_DURATION} unmountOnExit>
        <div
          className="message-bar"
          ref={this.el}
          style={{
            ...TRANSITION_BASE_STYLE,
            marginTop: `-${this.state.height}px`
          }}
        >
          {lede && <strong className="message-bar-intro">{lede}</strong>}
          {text && <span className="message-bar-text">{text}</span>}
          {link &&
            <a href={link} target="_blank" rel="noopener noreferrer" className="message-bar-link">
              {linkText || <FormattedMessage id="msg.more-info" defaultMessage="More info" />}
            </a>
          }
          <CloseButton
            onClick={this.onClickDismiss}
          />
        </div>
      </Transition>
    )
  }
}

export default MessageBar
