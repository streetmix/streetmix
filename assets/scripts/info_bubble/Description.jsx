import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import Triangle from './Triangle'
import { showDescription, hideDescription } from './description'
import { trackEvent } from '../app/event_tracking'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import { t } from '../app/locale'

export default class Description extends React.Component {
  static propTypes = {
    description: PropTypes.object,
    segment: PropTypes.shape({
      type: PropTypes.string,
      variantString: PropTypes.string
    }),
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
    trackEvent('INTERACTION', 'LEARN_MORE', this.props.segment.type, null, false)
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

  /**
   * Given an array of strings, returns true if it's falsy, an empty array,
   * or an array of empty strings.
   *
   * @param {Array} array
   */
  isEmptyText (array) {
    if (!array) return true
    if (Array.isArray(array)) {
      if (array.length === 0) return true

      let isEmpty = true
      for (let i = 0; i < array.length; i++) {
        if (array[i]) isEmpty = false
      }
      if (isEmpty) return true
    }

    return false
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

    // If the description text hasn't been translated, bail.
    const variantDescriptionText = t(`segments.${this.props.segment.type}.details.${this.props.segment.variantString}.description.text`, null, { ns: 'segment-info' })
    const segmentDescriptionText = t(`segments.${this.props.segment.type}.description.text`, null, { ns: 'segment-info' })
    const displayDescription = variantDescriptionText || segmentDescriptionText
    if (!displayDescription || this.isEmptyText(displayDescription)) return null

    // Get translated text for prompt, if it exists
    const defaultPrompt = description.prompt || <FormattedMessage id="segments.learn-more" defaultMessage="Learn more" />

    // TODO: use FormattedMessage
    const variantPrompt = t(`segments.${this.props.segment.type}.details.${this.props.segment.variantString}.description.prompt`, null, { ns: 'segment-info' })
    const segmentPrompt = t(`segments.${this.props.segment.type}.description.prompt`, defaultPrompt, { ns: 'segment-info' })
    const displayPrompt = variantPrompt || segmentPrompt

    // TODO: add alt text and requisite a11y attributes
    const image = (description.image) ? (
      <img src={`/images/info-bubble-examples/${description.image}`} />
    ) : null

    const variantLede = t(`segments.${this.props.segment.type}.details.${this.props.segment.variantString}.description.lede`, null, { ns: 'segment-info' })
    const segmentLede = t(`segments.${this.props.segment.type}.description.lede`, description.lede, { ns: 'segment-info' })
    const displayLede = variantLede || segmentLede
    const lede = (displayLede) ? (
      <p className="description-lede">{displayLede}</p>
    ) : null

    const text = this.renderText(displayDescription)

    const variantImageCaption = t(`segments.${this.props.segment.type}.details.${this.props.segment.variantString}.description.imageCaption`, null, { ns: 'segment-info' })
    const segmentImageCaption = t(`segments.${this.props.segment.type}.description.imageCaption`, description.imageCaption, { ns: 'segment-info' })
    const displayImageCaption = variantImageCaption || segmentImageCaption
    const caption = (displayImageCaption) ? (
      <footer>
        <FormattedMessage id="segments.description.photo-credit" defaultMessage="Photo:" />&nbsp;
        {displayImageCaption}
      </footer>
    ) : null

    return (
      <React.Fragment>
        <div
          className="description-prompt"
          onClick={this.onClickShow}
          onMouseOver={this.props.toggleHighlightTriangle}
          onMouseOut={this.props.toggleHighlightTriangle}
        >
          {displayPrompt}
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
            <FormattedMessage id="btn.close" defaultMessage="Close" />
          </div>
          <Triangle highlight={this.state.highlightTriangle} />
        </div>
      </React.Fragment>
    )
  }
}
