import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import DescriptionPanel from './DescriptionPanel'
import { getSegmentInfo, getSegmentVariantInfo } from '../segments/info'
import { trackEvent } from '../app/event_tracking'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import { t } from '../locales/locale'
import { showDescription, hideDescription } from '../store/actions/infoBubble'

export class Description extends React.Component {
  static propTypes = {
    type: PropTypes.string,
    variantString: PropTypes.string,
    updateHoverPolygon: PropTypes.func.isRequired,
    updateBubbleDimensions: PropTypes.func.isRequired,
    onMouseOver: PropTypes.func.isRequired,
    onMouseOut: PropTypes.func.isRequired,
    descriptionVisible: PropTypes.bool.isRequired,
    showDescription: PropTypes.func.isRequired,
    hideDescription: PropTypes.func.isRequired,
    infoBubbleEl: PropTypes.object
  }

  handleClickShow = () => {
    this.props.showDescription()
    this.props.updateBubbleDimensions()
    this.props.updateHoverPolygon()

    registerKeypress('esc', this.handleClickHide)
    trackEvent('INTERACTION', 'LEARN_MORE', this.props.type, null, false)
  }

  handleClickHide = () => {
    this.props.hideDescription()
    this.props.updateBubbleDimensions()
    this.props.updateHoverPolygon()

    deregisterKeypress('esc', this.handleClickHide)
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

    if (!description || !this.props.infoBubbleEl) return null

    // If the description text doesn't exist or hasn't been translated, bail.
    const text = t(`descriptions.${description.key}.text`, null, { ns: 'segment-info' })
    if (!text || this.isEmptyText(text)) return null

    const defaultPrompt = <FormattedMessage id="segments.learn-more" defaultMessage="Learn more" />

    // TODO: use FormattedMessage
    const prompt = t(`descriptions.${description.key}.prompt`, defaultPrompt, { ns: 'segment-info' })
    const lede = t(`descriptions.${description.key}.lede`, null, { ns: 'segment-info' })
    const imageCaption = t(`descriptions.${description.key}.imageCaption`, null, { ns: 'segment-info' })

    return (
      <>
        <div
          className="description-prompt"
          onClick={this.handleClickShow}
          onMouseOver={this.props.onMouseOver}
          onMouseOut={this.props.onMouseOut}
        >
          {prompt}
        </div>
        <DescriptionPanel
          visible={this.props.descriptionVisible}
          onClickHide={this.handleClickHide}
          image={description.image}
          lede={lede}
          text={text}
          caption={imageCaption}
          bubbleY={Number.parseInt(this.props.infoBubbleEl.style.top)}
        />
      </>
    )
  }
}

const mapStateToProps = (state) => ({
  descriptionVisible: state.infoBubble.descriptionVisible
})

const mapDispatchToProps = {
  showDescription,
  hideDescription
}

export default connect(mapStateToProps, mapDispatchToProps)(Description)
