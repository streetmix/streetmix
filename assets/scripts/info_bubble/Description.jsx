import React from 'react'
import PropTypes from 'prop-types'
import { showDescription, hideDescription, highlightTriangle, unhighlightTriangle } from './description'
import { t } from '../app/locale'

export default class Description extends React.Component {
  static propTypes = {
    description: PropTypes.object,
    type: PropTypes.string
  }

  constructor (props) {
    super(props)

    this.text = null
  }

  componentDidMount () {
    this.retargetAnchors()
  }

  componentDidUpdate () {
    this.retargetAnchors()
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

    return (
      <div>
        <div
          className="description-prompt"
          onClick={showDescription}
          onMouseOver={highlightTriangle}
          onMouseOut={unhighlightTriangle}
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
            onClick={hideDescription}
            onMouseOver={highlightTriangle}
            onMouseOut={unhighlightTriangle}
          >
            {t('btn.close', 'Close')}
          </div>
          <div className="info-bubble-triangle" />
        </div>
      </div>
    )
  }
}
