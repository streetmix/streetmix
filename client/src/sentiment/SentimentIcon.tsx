import { useIntl } from 'react-intl'

import './SentimentIcon.css'

interface SentimentIconProps {
  label: {
    localizationKey: string
    defaultMessage: string
  }
  imgSrc: string
  className: string
}

export function SentimentIcon({
  label,
  imgSrc,
  className,
}: SentimentIconProps) {
  const intl = useIntl()
  const text = intl.formatMessage({
    id: label.localizationKey,
    defaultMessage: label.defaultMessage,
  })

  return (
    <div className={`sentiment-icon ${className}`}>
      <img src={imgSrc} draggable="false" alt={text} />
    </div>
  )
}
