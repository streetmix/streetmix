import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, useIntl } from 'react-intl'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import { putSentimentSurveyComment } from '../util/api'

const MAX_COMMENT_LENGTH = 280

VoteComment.propTypes = {
  streetId: PropTypes.string
}

function VoteComment ({ streetId }) {
  const [comment, setComment] = useState('')
  const [isPending, setPending] = useState(false)
  const [isComplete, setComplete] = useState(false)
  const intl = useIntl()

  function handleSubmitComment (event) {
    setPending(true)
    try {
      // Only run if streetId is actually present.
      if (streetId) {
        putSentimentSurveyComment({
          id: streetId,
          comment
        })
      }
    } catch (error) {
      console.error(error)
    }
    // Post comment here
    window.setTimeout(() => {
      // Assume completion; fail silently on errors
      setComplete(true)
    }, 1000)
  }

  return (
    <div className="sentiment-survey-done-comment">
      <input
        type="text"
        value={comment}
        maxLength={MAX_COMMENT_LENGTH}
        onChange={(e) => setComment(e.target.value)}
        placeholder={intl.formatMessage({
          id: 'sentiment.comment.example',
          defaultMessage: '(for instance, “I liked the trees.”)'
        })}
      />
      {isComplete
        ? (
          <FormattedMessage
            id="sentiment.comment.thanks"
            defaultMessage="Got it!"
          />
          )
        : isPending
          ? (
            <LoadingSpinner size="small" />
            )
          : (
            <Button secondary={true} onClick={handleSubmitComment}>
              <FormattedMessage
                id="sentiment.comment.submit"
                defaultMessage="Submit"
              />
            </Button>
            )}
    </div>
  )
}

export default VoteComment
