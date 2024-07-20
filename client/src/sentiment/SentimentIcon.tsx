import React from 'react'
import { useIntl } from 'react-intl'

import './SentimentIcon.scss'

interface SentimentIconProps {
  label: {
    localizationKey: string
    defaultMessage: string
  }
  imgSrc: string
  className: string
}

function SentimentIcon ({
  label,
  imgSrc,
  className
}: SentimentIconProps): React.ReactElement {
  const intl = useIntl()
  const text = intl.formatMessage({
    id: label.localizationKey,
    defaultMessage: label.defaultMessage
  })

  return (
    <div className={`sentiment-icon ${className}`}>
      <img src={imgSrc} draggable="false" alt={text} />
    </div>
  )
}

export default SentimentIcon
