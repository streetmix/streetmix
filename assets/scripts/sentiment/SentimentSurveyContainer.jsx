import React, { useState, useEffect } from 'react'
import SentimentSurvey from './SentimentSurvey'

function SentimentSurveyContainer (props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    window.setTimeout(() => {
      console.log('appear!')
      setVisible(true)
    }, 1000)
  })

  function handleClose () {
    console.log('byeeeee')
    setVisible(false)
  }

  return <SentimentSurvey visible={visible} onClose={handleClose} />
}

export default SentimentSurveyContainer
