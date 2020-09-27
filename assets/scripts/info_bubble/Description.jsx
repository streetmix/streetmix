import React from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import DescriptionPanel from './DescriptionPanel'
import { getSegmentInfo, getSegmentVariantInfo } from '../segments/info'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import { formatMessage } from '../locales/locale'
import { showDescription, hideDescription } from '../store/slices/infoBubble'

function getDescriptionData (type, variantString) {
  if (!type) return null

  const segmentInfo = getSegmentInfo(type)
  const variantInfo = getSegmentVariantInfo(type, variantString)

  if (variantInfo && variantInfo.description) {
    return variantInfo.description
  } else if (segmentInfo && segmentInfo.description) {
    return segmentInfo.description
  }

  return null
}

Description.propTypes = {
  type: PropTypes.string,
  variantString: PropTypes.string,
  updateHoverPolygon: PropTypes.func.isRequired,
  updateBubbleDimensions: PropTypes.func.isRequired,
  onMouseOver: PropTypes.func.isRequired,
  onMouseOut: PropTypes.func.isRequired,
  infoBubbleEl: PropTypes.object
}

function Description (props) {
  const descriptionVisible = useSelector(
    (state) => state.infoBubble.descriptionVisible
  )
  const noInternet = useSelector((state) => state.system.noInternet)
  const dispatch = useDispatch()

  function handleClickShow () {
    dispatch(showDescription())
    props.updateBubbleDimensions()
    props.updateHoverPolygon()

    registerKeypress('esc', handleClickHide)
  }

  function handleClickHide () {
    dispatch(hideDescription())
    props.updateBubbleDimensions()
    props.updateHoverPolygon()

    deregisterKeypress('esc', handleClickHide)
  }

  const description = getDescriptionData(props.type, props.variantString)

  if (!description || !props.infoBubbleEl) return null

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
        onClick={handleClickShow}
        onMouseOver={props.onMouseOver}
        onMouseOut={props.onMouseOut}
      >
        {prompt}
      </div>
      <DescriptionPanel
        visible={descriptionVisible}
        onClickHide={handleClickHide}
        image={description.image}
        content={content}
        caption={imageCaption}
        noInternet={noInternet}
        bubbleY={Number.parseInt(props.infoBubbleEl.style.top)}
      />
    </>
  )
}

export default Description
