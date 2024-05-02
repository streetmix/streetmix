import React from 'react'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { getSegmentInfo, getSegmentVariantInfo } from '~/src/segments/info'
import { registerKeypress, deregisterKeypress } from '~/src/app/keypress'
import { formatMessage } from '~/src/locales/locale'
import {
  showDescription,
  hideDescription
} from '~/src/store/slices/infoBubble'
import DescriptionPanel from './DescriptionPanel'

import type { SegmentDescription } from '@streetmix/types'

function getDescriptionData (
  type: string,
  variantString: string
): SegmentDescription | undefined {
  const segmentInfo = getSegmentInfo(type)
  const variantInfo = getSegmentVariantInfo(type, variantString)

  return variantInfo?.description ?? segmentInfo?.description
}

interface DescriptionProps {
  type: string
  variantString: string
  updateHoverPolygon: () => void
  updateBubbleDimensions: () => void
  onMouseOver: () => void
  onMouseOut: () => void
  infoBubbleEl: HTMLDivElement | null
}

function Description ({
  type,
  variantString,
  updateHoverPolygon,
  updateBubbleDimensions,
  onMouseOver,
  onMouseOut,
  infoBubbleEl
}: DescriptionProps): React.ReactElement | null {
  const descriptionVisible = useSelector(
    (state) => state.infoBubble.descriptionVisible
  )
  const offline = useSelector((state) => state.system.offline)
  const dispatch = useDispatch()

  function handleClickShow (): void {
    dispatch(showDescription())
    updateBubbleDimensions()
    updateHoverPolygon()

    registerKeypress('esc', handleClickHide)
  }

  function handleClickHide (): void {
    dispatch(hideDescription())
    updateBubbleDimensions()
    updateHoverPolygon()

    deregisterKeypress('esc', handleClickHide)
  }

  const description = getDescriptionData(type, variantString)

  if (description === undefined || infoBubbleEl === null) return null

  // If the description content doesn't exist or hasn't been translated, bail.
  const content = formatMessage(
    `descriptions.${description.key}.content`,
    undefined,
    {
      ns: 'segment-info'
    }
  )

  // Undefined content formats as the empty string
  if (content === '') return null

  const defaultPrompt = formatMessage('segments.learn-more', 'Learn more')
  const prompt = formatMessage(
    `descriptions.${description.key}.prompt`,
    defaultPrompt as string,
    {
      ns: 'segment-info'
    }
  )
  const imageCaption = formatMessage(
    `descriptions.${description.key}.imageCaption`,
    undefined,
    { ns: 'segment-info' }
  )

  return (
    <>
      <div
        className="description-prompt"
        onClick={handleClickShow}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
      >
        {prompt}
      </div>
      <DescriptionPanel
        visible={descriptionVisible}
        onClickHide={handleClickHide}
        image={description.image}
        content={content as string}
        caption={imageCaption as string}
        offline={offline}
        bubbleY={Number.parseInt(infoBubbleEl.style.top)}
      />
    </>
  )
}

export default Description
