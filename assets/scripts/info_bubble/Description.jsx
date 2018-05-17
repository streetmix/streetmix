import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import DescriptionPanel from './DescriptionPanel'
import { infoBubble } from './info_bubble'
import { trackEvent } from '../app/event_tracking'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import { t } from '../app/locale'
import { showDescription, hideDescription } from '../store/actions/infoBubble'

export class Description extends React.Component {
  static propTypes = {
    description: PropTypes.object,
    segment: PropTypes.shape({
      type: PropTypes.string,
      variantString: PropTypes.string
    }),
    updateBubbleDimensions: PropTypes.func.isRequired,
    toggleHighlightTriangle: PropTypes.func.isRequired,
    descriptionVisible: PropTypes.bool.isRequired,
    showDescription: PropTypes.func.isRequired,
    hideDescription: PropTypes.func.isRequired
  }

  onClickShow = () => {
    this.props.showDescription()
    this.props.updateBubbleDimensions()

    // TODO refactor
    if (infoBubble.segmentEl) {
      infoBubble.segmentEl.classList.add('hide-drag-handles-when-description-shown')
    }

    infoBubble.updateHoverPolygon()
    // end TODO

    registerKeypress('esc', this.onClickHide)
    trackEvent('INTERACTION', 'LEARN_MORE', this.props.segment.type, null, false)
  }

  onClickHide = () => {
    this.props.hideDescription()
    this.props.updateBubbleDimensions()

    // TODO refactor
    if (infoBubble.segmentEl) {
      infoBubble.segmentEl.classList.remove('hide-drag-handles-when-description-shown')
    }

    infoBubble.updateHoverPolygon()
    // end TODO

    deregisterKeypress('esc', this.onClickHide)
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

  render () {
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

    const variantLede = t(`segments.${this.props.segment.type}.details.${this.props.segment.variantString}.description.lede`, null, { ns: 'segment-info' })
    const segmentLede = t(`segments.${this.props.segment.type}.description.lede`, description.lede, { ns: 'segment-info' })
    const displayLede = variantLede || segmentLede

    const variantImageCaption = t(`segments.${this.props.segment.type}.details.${this.props.segment.variantString}.description.imageCaption`, null, { ns: 'segment-info' })
    const segmentImageCaption = t(`segments.${this.props.segment.type}.description.imageCaption`, description.imageCaption, { ns: 'segment-info' })
    const displayImageCaption = variantImageCaption || segmentImageCaption

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
        <DescriptionPanel
          visible={this.props.descriptionVisible}
          onClickHide={this.onClickHide}
          image={description.image}
          lede={displayLede}
          text={displayDescription}
          caption={displayImageCaption}
        />
      </React.Fragment>
    )
  }
}

function mapStateToProps (state) {
  return {
    descriptionVisible: state.infoBubble.descriptionVisible
  }
}

function mapDispatchToProps (dispatch) {
  return {
    showDescription: () => { dispatch(showDescription()) },
    hideDescription: () => { dispatch(hideDescription()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Description)
