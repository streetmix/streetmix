import React, { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import LoadingSpinner from '../ui/LoadingSpinner'

const MAX_COMMENT_LENGTH = 280

function VoteComment (props) {
  const [comment, setComment] = useState('')
  const [isPending, setPending] = useState(false)
  const [isComplete, setComplete] = useState(false)
  const intl = useIntl()

  function handleSubmitComment (event) {
    setPending(true)
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
      {isComplete ? (
        <FormattedMessage
          id="sentiment.comment.thanks"
          defaultMessage="Got it!"
        />
      ) : isPending ? (
        <LoadingSpinner size="small" />
      ) : (
        <button className="button-secondary" onClick={handleSubmitComment}>
          <FormattedMessage
            id="sentiment.comment.submit"
            defaultMessage="Submit"
          />
        </button>
      )}
    </div>
  )
}

export default VoteComment
