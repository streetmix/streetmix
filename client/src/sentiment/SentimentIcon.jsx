import React from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import './SentimentIcon.scss'

SentimentIcon.propTypes = {
  score: PropTypes.oneOf([-1, -0.5, 0, 0.5, 1]),
  label: PropTypes.shape({
    localizationKey: PropTypes.string,
    defaultMessage: PropTypes.string
  }),
  imgSrc: PropTypes.string,
  className: PropTypes.string
}

function SentimentIcon ({ score, label, imgSrc, className }) {
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
