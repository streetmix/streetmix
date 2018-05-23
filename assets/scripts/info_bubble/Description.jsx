import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import DescriptionPanel from './DescriptionPanel'
import { infoBubble } from './info_bubble'
import { getSegmentInfo, getSegmentVariantInfo } from '../segments/info'
import { trackEvent } from '../app/event_tracking'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import { t } from '../app/locale'
import { showDescription, hideDescription } from '../store/actions/infoBubble'

export class Description extends React.Component {
  static propTypes = {
    type: PropTypes.string,
    variantString: PropTypes.string,
    updateBubbleDimensions: PropTypes.func.isRequired,
    toggleHighlightTriangle: PropTypes.func.isRequired,
    descriptionVisible: PropTypes.bool.isRequired,
    showDescription: PropTypes.func.isRequired,
    hideDescription: PropTypes.func.isRequired,
    bubbleY: PropTypes.number,
    segmentEl: PropTypes.object
  }

  onClickShow = () => {
    this.props.showDescription()
    this.props.updateBubbleDimensions()

    // TODO refactor - segment element should handle this whenever descriptionVisible is true
    if (this.props.segmentEl) {
      this.props.segmentEl.classList.add('hide-drag-handles-when-description-shown')
    }

    infoBubble.updateHoverPolygon()
    // end TODO

    registerKeypress('esc', this.onClickHide)
    trackEvent('INTERACTION', 'LEARN_MORE', this.props.type, null, false)
  }

  onClickHide = () => {
    this.props.hideDescription()
    this.props.updateBubbleDimensions()

    // TODO refactor
    if (this.props.segmentEl) {
      this.props.segmentEl.classList.remove('hide-drag-handles-when-description-shown')
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

  getDescriptionData (type, variantString) {
    if (!type || !variantString) return null

    const segmentInfo = getSegmentInfo(type)
    const variantInfo = getSegmentVariantInfo(type, variantString)

    if (variantInfo && variantInfo.description) {
      return variantInfo.description
    } else if (segmentInfo && segmentInfo.description) {
      return segmentInfo.description
    } else {
      return null
    }
  }

  render () {
    const description = this.getDescriptionData(this.props.type, this.props.variantString)

    if (!description) return null

    // If the description text hasn't been translated, bail.
    const variantDescriptionText = t(`segments.${this.props.type}.details.${this.props.variantString}.description.text`, null, { ns: 'segment-info' })
    const segmentDescriptionText = t(`segments.${this.props.type}.description.text`, null, { ns: 'segment-info' })
    const displayDescription = variantDescriptionText || segmentDescriptionText
    if (!displayDescription || this.isEmptyText(displayDescription)) return null

    // Get translated text for prompt, if it exists
    const defaultPrompt = description.prompt || <FormattedMessage id="segments.learn-more" defaultMessage="Learn more" />

    // TODO: use FormattedMessage
    const variantPrompt = t(`segments.${this.props.type}.details.${this.props.variantString}.description.prompt`, null, { ns: 'segment-info' })
    const segmentPrompt = t(`segments.${this.props.type}.description.prompt`, defaultPrompt, { ns: 'segment-info' })
    const displayPrompt = variantPrompt || segmentPrompt

    const variantLede = t(`segments.${this.props.type}.details.${this.props.variantString}.description.lede`, null, { ns: 'segment-info' })
    const segmentLede = t(`segments.${this.props.type}.description.lede`, description.lede, { ns: 'segment-info' })
    const displayLede = variantLede || segmentLede

    const variantImageCaption = t(`segments.${this.props.type}.details.${this.props.variantString}.description.imageCaption`, null, { ns: 'segment-info' })
    const segmentImageCaption = t(`segments.${this.props.type}.description.imageCaption`, description.imageCaption, { ns: 'segment-info' })
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
          bubbleY={this.props.bubbleY}
        />
      </React.Fragment>
    )
  }
}

function mapStateToProps (state) {
  return {
    descriptionVisible: state.infoBubble.descriptionVisible,
    bubbleY: state.infoBubble.bubbleY
  }
}

function mapDispatchToProps (dispatch) {
  return {
    showDescription: () => { dispatch(showDescription()) },
    hideDescription: () => { dispatch(hideDescription()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Description)
