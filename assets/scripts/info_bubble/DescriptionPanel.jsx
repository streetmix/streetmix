import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
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
    lede: PropTypes.string,
    text: PropTypes.arrayOf(PropTypes.string),
    caption: PropTypes.string,
    onClickHide: PropTypes.func,
    bubbleY: PropTypes.number
  }

  static defaultProps = {
    visible: false,
    onClickHide: () => {}
  }

  constructor (props) {
    super(props)

    this.text = null

    this.state = {
      highlightTriangle: false
    }
  }

  componentDidMount () {
    this.retargetAnchors()
  }

  componentDidUpdate () {
    this.retargetAnchors()
  }

  unhighlightTriangleDelayed = () => {
    window.setTimeout(() => {
      this.setState({ highlightTriangle: false })
    }, 200)
  }

  toggleHighlightTriangle = () => {
    this.setState({ highlightTriangle: !this.state.highlightTriangle })
  }

  /**
   * After rendering, modify DOM output to ensure all links inside of
   * description text opens in a new window
   */
  retargetAnchors = () => {
    if (!this.text) return
    const links = this.text.querySelectorAll('a')
    for (let link of links) {
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
    }
  }

  onClickHide = (event) => {
    this.props.onClickHide()
    this.unhighlightTriangleDelayed()
  }

  /**
   * Renders description text
   *
   * @param {Array} text - array of paragraphs (as strings)
   */
  renderText (text) {
    if (!text) return null
    return text.map((paragraph, index) => {
      const html = {
        __html: paragraph
      }
      return <p key={index} dangerouslySetInnerHTML={html} />
    })
  }

  render () {
    // TODO document magic numbers
    const height = (getStreetSectionTop() + 300 - this.props.bubbleY) + 'px'

    return (
      <Transition in={this.props.visible} timeout={TRANSITION_DURATION}>
        {(state) => (
          <div className="description-canvas" style={{
            ...DEFAULT_STYLE,
            ...TRANSITION_STYLES[state],
            height
          }}>
            <div className="description" ref={(ref) => { this.text = ref }}>
              {/* TODO: add alt text and requisite a11y attributes */}
              {this.props.image && <img src={`/images/info-bubble-examples/${this.props.image}`} />}
              {this.props.lede && <p className="description-lede" dangerouslySetInnerHTML={{ __html: this.props.lede }} />}
              {this.renderText(this.props.text)}
              {this.props.caption && (
                <footer>
                  <FormattedMessage id="segments.description.photo-credit" defaultMessage="Photo:" />&nbsp;
                  {this.props.caption}
                </footer>
              )}
            </div>
            <div
              className="description-close"
              onClick={this.onClickHide}
              onMouseOver={this.toggleHighlightTriangle}
              onMouseOut={this.toggleHighlightTriangle}
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
