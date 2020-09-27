import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import ReactMarkdown from 'react-markdown'
import Transition from 'react-transition-group/Transition'
import Triangle from './Triangle'
import { getStreetSectionTop } from '../app/window_resize'
import './DescriptionPanel.scss'

const TRANSITION_DURATION = 250
const DEFAULT_STYLE = {
  opacity: 0,
  transformOrigin: '50% 0',
  transform: 'rotateX(20deg) translateY(100px)',
  transition: `opacity ${TRANSITION_DURATION}ms, transform ${TRANSITION_DURATION}ms`
}
const TRANSITION_STYLES = {
  entering: {
    opacity: 1,
    transform: 'none'
  },
  entered: {
    opacity: 1,
    transform: 'none'
  }
}

export default class DescriptionPanel extends React.Component {
  static propTypes = {
    visible: PropTypes.bool,
    image: PropTypes.string,
    content: PropTypes.string,
    caption: PropTypes.string,
    onClickHide: PropTypes.func,
    bubbleY: PropTypes.number,
    noInternet: PropTypes.bool
  }

  static defaultProps = {
    visible: false,
    onClickHide: () => {}
  }

  constructor (props) {
    super(props)

    this.state = {
      highlightTriangle: false
    }
  }

  unhighlightTriangleDelayed = () => {
    window.setTimeout(() => {
      this.setState({ highlightTriangle: false })
    }, 200)
  }

  handleToggleHighlightTriangle = () => {
    this.setState({ highlightTriangle: !this.state.highlightTriangle })
  }

  handleClickHide = (event) => {
    this.props.onClickHide()
    this.unhighlightTriangleDelayed()
  }

  render () {
    // TODO document magic numbers
    const height = getStreetSectionTop() + 300 - this.props.bubbleY + 'px'

    return (
      <Transition in={this.props.visible} timeout={TRANSITION_DURATION}>
        {(state) => (
          <div
            className="description-canvas"
            style={{
              ...DEFAULT_STYLE,
              ...TRANSITION_STYLES[state],
              height
            }}
          >
            <div className="description">
              <div className="description-content">
                {/* TODO: add alt text and requisite a11y attributes */}
                {this.props.image && (
                  <img
                    src={`/images/info-bubble-examples/${this.props.image}`}
                  />
                )}
                <div className="description-text">
                  <ReactMarkdown
                    source={this.props.content}
                    allowedTypes={[
                      'root',
                      'text',
                      'paragraph',
                      'emphasis',
                      'strong',
                      'list',
                      'listItem',
                      'blockquote',
                      'heading',
                      !this.props.noInternet && 'link'
                    ]}
                    unwrapDisallowed={true}
                    linkTarget="_blank"
                  />
                  {this.props.caption && (
                    <footer>
                      <FormattedMessage
                        id="segments.description.photo-credit"
                        defaultMessage="Photo:"
                      />
                      &nbsp;
                      {this.props.caption}
                    </footer>
                  )}
                </div>
              </div>
            </div>
            <div
              className="description-close"
              onClick={this.handleClickHide}
              onMouseOver={this.handleToggleHighlightTriangle}
              onMouseOut={this.handleToggleHighlightTriangle}
            >
              <FormattedMessage id="btn.close" defaultMessage="Close" />
            </div>
            <Triangle highlight={this.state.highlightTriangle} />
          </div>
        )}
      </Transition>
    )
  }
}
