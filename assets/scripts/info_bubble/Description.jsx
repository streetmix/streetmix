import React from 'react'
import PropTypes from 'prop-types'
import { showDescription, hideDescription } from './description'
import { trackEvent } from '../app/event_tracking'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import { t } from '../app/locale'

export default class Description extends React.Component {
  static propTypes = {
    description: PropTypes.object,
    type: PropTypes.string,
    updateBubbleDimensions: PropTypes.func.isRequired,
    toggleHighlightTriangle: PropTypes.func.isRequired
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

  onClickShow = () => {
    showDescription()
    this.unhighlightTriangleDelayed()
    this.props.updateBubbleDimensions()

    registerKeypress('esc', this.onClickHide)
    trackEvent('INTERACTION', 'LEARN_MORE', this.props.type, null, false)
  }

  onClickHide = () => {
    hideDescription()
    this.unhighlightTriangleDelayed()
    this.props.updateBubbleDimensions()

    deregisterKeypress('esc', hideDescription)
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
   *  After rendering, ensure all links in description open in a new window
   */
  retargetAnchors = () => {
    if (!this.text) return
    const links = this.text.querySelectorAll('a')
    for (let link of links) {
      link.target = '_blank'
    }
  }

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
    const description = this.props.description

    if (!description) return null

    // Get translated text for prompt, if it exists
    const defaultPrompt = description.prompt || t('segments.learn-more', 'Learn more')
    const prompt = t(`segments.${this.props.type}.description.prompt`, defaultPrompt, { ns: 'segment-info' })

    // TODO: add alt text and requisite a11y attributes
    const image = (description.image) ? (
      <img src={`/images/info-bubble-examples/${description.image}`} />
    ) : null

    const lede = (description.lede) ? (
      <p className="description-lede">{description.lede}</p>
    ) : null

    const text = this.renderText(description.text)

    const caption = (description.imageCaption) ? (
      <footer>Photo: {description.imageCaption}</footer>
    ) : null

    // Triangle is highlighted when description button is hovered
    let triangleClassNames = ['info-bubble-triangle']
    if (this.state.highlightTriangle === true) {
      triangleClassNames.push('info-bubble-triangle-highlight')
    }

    return (
      <React.Fragment>
        <div
          className="description-prompt"
          onClick={this.onClickShow}
          onMouseOver={this.props.toggleHighlightTriangle}
          onMouseOut={this.props.toggleHighlightTriangle}
        >
          {prompt}
        </div>
        <div className="description-canvas" style={height}>
          <div className="description" ref={(ref) => { this.text = ref }}>
            {image}
            {lede}
            {text}
            {caption}
          </div>
          <div
            className="description-close"
            onClick={this.onClickHide}
            onMouseOver={this.toggleHighlightTriangle}
            onMouseOut={this.toggleHighlightTriangle}
          >
            {t('btn.close', 'Close')}
          </div>
          <div className={triangleClassNames.join(' ')} />
        </div>
      </React.Fragment>
    )
  }
}
