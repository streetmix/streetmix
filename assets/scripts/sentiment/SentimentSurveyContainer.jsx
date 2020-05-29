import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import SentimentSurvey from './SentimentSurvey'

function SentimentSurveyContainer (props) {
  const [isVisible, setVisible] = useState(false)
  const [isDismissed, setDismissed] = useState(false)
  const isEnabled = useSelector(
    (state) => state.flags.SENTIMENT_SURVEY.value || false
  )

  useEffect(() => {
    if (!isDismissed) {
      window.setTimeout(() => {
        setVisible(true)
      }, 1000)
    }
  })

  function handleClose () {
    setVisible(false)
    setDismissed(true)
  }

  function handleVote (score) {
    console.log('score ' + score + ' received!')
  }

  if (isEnabled) {
    return (
      <SentimentSurvey
        visible={isVisible}
        onClose={handleClose}
        handleVote={handleVote}
      />
    )
  }

  return null
}

export default SentimentSurveyContainer
