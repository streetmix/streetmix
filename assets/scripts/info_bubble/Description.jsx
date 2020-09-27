import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import DescriptionPanel from './DescriptionPanel'
import { getSegmentInfo, getSegmentVariantInfo } from '../segments/info'
import { trackEvent } from '../app/event_tracking'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import { formatMessage } from '../locales/locale'
import { showDescription, hideDescription } from '../store/slices/infoBubble'

export class Description extends React.Component {
  static propTypes = {
    type: PropTypes.string,
    variantString: PropTypes.string,
    updateHoverPolygon: PropTypes.func.isRequired,
    updateBubbleDimensions: PropTypes.func.isRequired,
    onMouseOver: PropTypes.func.isRequired,
    onMouseOut: PropTypes.func.isRequired,
    descriptionVisible: PropTypes.bool.isRequired,
    noInternet: PropTypes.bool.isRequired,
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

  getDescriptionData (type, variantString) {
    if (!type) return null

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
    const description = this.getDescriptionData(
      this.props.type,
      this.props.variantString
    )

    if (!description || !this.props.infoBubbleEl) return null

    // If the description content doesn't exist or hasn't been translated, bail.
    const content = formatMessage(
      `descriptions.${description.key}.content`,
      null,
      {
        ns: 'segment-info'
      }
    )
    if (!content) return null

    const defaultPrompt = (
      <FormattedMessage id="segments.learn-more" defaultMessage="Learn more" />
    )

    // TODO: use FormattedMessage
    const prompt = formatMessage(
      `descriptions.${description.key}.prompt`,
      defaultPrompt,
      {
        ns: 'segment-info'
      }
    )
    const imageCaption = formatMessage(
      `descriptions.${description.key}.imageCaption`,
      null,
      { ns: 'segment-info' }
    )

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
          content={content}
          caption={imageCaption}
          noInternet={this.props.noInternet}
          bubbleY={Number.parseInt(this.props.infoBubbleEl.style.top)}
        />
      </>
    )
  }
}

const mapStateToProps = (state) => ({
  descriptionVisible: state.infoBubble.descriptionVisible,
  noInternet: state.system.noInternet
})

const mapDispatchToProps = {
  showDescription,
  hideDescription
}

export default connect(mapStateToProps, mapDispatchToProps)(Description)
