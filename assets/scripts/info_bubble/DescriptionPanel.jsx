import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import Triangle from './Triangle'

export default class DescriptionPanel extends React.Component {
  static propTypes = {
    image: PropTypes.string,
    lede: PropTypes.string,
    text: PropTypes.arrayOf(PropTypes.string),
    caption: PropTypes.string
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

  toggleHighlightTriangle = () => {
    this.setState({ highlightTriangle: !this.state.highlightTriangle })
  }

  /**
   *  After rendering, ensure all links in description open in a new window
   */
  retargetAnchors = () => {
    if (!this.text) return
    const links = this.text.querySelectorAll('a')
    for (let link of links) {
      link.target = '_blank'
    }
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
    const height = null // height: 505px;

    return (
      <div className="description-canvas" style={height}>
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
    )
  }
}
