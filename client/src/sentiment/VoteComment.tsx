import React, { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import { putSentimentSurveyComment } from '../util/api'

const MAX_COMMENT_LENGTH = 280

interface VoteCommentProps {
  streetId: string
}

function VoteComment ({ streetId }: VoteCommentProps): React.ReactElement {
  const [comment, setComment] = useState('')
  const [isPending, setPending] = useState(false)
  const [isComplete, setComplete] = useState(false)
  const intl = useIntl()

  async function handleSubmitComment (): Promise<void> {
    setPending(true)

    await putSentimentSurveyComment({
      id: streetId,
      comment
    })

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
        onChange={(e) => {
          setComment(e.target.value)
        }}
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
            <Button
              secondary={true}
              onClick={() => {
                void handleSubmitComment()
              }}
            >
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
