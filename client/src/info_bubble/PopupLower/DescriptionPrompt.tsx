import React from 'react'

import { useDispatch } from '~/src/store/hooks'
import { getSegmentInfo, getSegmentVariantInfo } from '~/src/segments/info'
import { formatMessage } from '~/src/locales/locale'
import { showDescription } from '~/src/store/slices/infoBubble'
import './DescriptionPrompt.css'

import type { SliceDescription } from '@streetmix/types'

function getDescriptionData (
  type: string,
  variantString: string
): SliceDescription | undefined {
  const segmentInfo = getSegmentInfo(type)
  const variantInfo = getSegmentVariantInfo(type, variantString)

  return variantInfo?.description ?? segmentInfo?.description
}

interface DescriptionProps {
  type: string
  variantString: string
  onMouseOver: () => void
  onMouseOut: () => void
}

function DescriptionPrompt ({
  type,
  variantString,
  onMouseOver,
  onMouseOut
}: DescriptionProps): React.ReactElement | null {
  const dispatch = useDispatch()
  const description = getDescriptionData(type, variantString)

  function handleClickShow (): void {
    console.log(description)
    dispatch(showDescription(description))
  }

  if (description === undefined) return null

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
    defaultPrompt,
    {
      ns: 'segment-info'
    }
  )

  return (
    <div
      className="description-prompt"
      onClick={handleClickShow}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      {prompt}
    </div>
  )
}

export default DescriptionPrompt
