import React, { useEffect, useRef } from 'react'
import { FormattedMessage } from 'react-intl'

import Button from '../ui/Button'
import VoteComment from './VoteComment'
import SentimentIcon from './SentimentIcon'
import { getDataForScore } from './scores'
import './VoteReceipt.css'

interface VoteReceiptProps {
  score?: number
  handleClose: () => void
  streetId: string
}

function VoteReceipt ({
  score,
  handleClose,
  streetId
}: VoteReceiptProps): React.ReactElement | null {
  const doneEl = useRef<HTMLDivElement>(null)

  // When a score is received, we animate the background container
  // in first (which "fades out" the original content, then fade in
  // the new content on top of it.)
  useEffect(() => {
    if (score !== undefined) {
      window.setTimeout(() => {
        if (!doneEl.current) return
        doneEl.current.classList.add('visible')
        window.setTimeout(() => {
          if (!doneEl.current) return
          doneEl.current.querySelector('div')?.classList.add('visible')
        }, 600)
      }, 1200)
    }
  }, [score])

  if (score === undefined) return null

  const vote = getDataForScore(score)

  return (
    <div className="sentiment-survey-done-container" ref={doneEl}>
      <div className="sentiment-survey-done-content">
        <h2>
          <FormattedMessage
            id="sentiment.thank-you"
            defaultMessage="Thank you!"
          />
        </h2>
        <div className="sentiment-survey-done-text">
          <div>
            <SentimentIcon {...vote} />
          </div>
          <div>
            <p>
              <strong>
                <FormattedMessage
                  id="sentiment.prompt.joyful"
                  defaultMessage="Would you say this street feels <em>joyful</em>?"
                  values={{
                    em: (chunks) => <em>{chunks}</em>
                  }}
                />
              </strong>
            </p>
            <p>
              <FormattedMessage
                id="sentiment.done.response"
                defaultMessage="You responded {score}."
                values={{
                  score: (
                    <em>
                      <FormattedMessage
                        id={vote.label.localizationKey}
                        defaultMessage={vote.label.defaultMessage}
                      />
                    </em>
                  )
                }}
              />{' '}
              <FormattedMessage
                id="sentiment.comment.prompt"
                defaultMessage="Tell us why:"
              />
            </p>
            <VoteComment streetId={streetId} />
          </div>
        </div>
        <div className="sentiment-survey-done-buttons">
          <Button primary={true} href="/survey">
            <FormattedMessage
              id="sentiment.done.vote-another"
              defaultMessage="Vote on another!"
            />
          </Button>
          <Button tertiary={true} onClick={handleClose}>
            <FormattedMessage
              id="sentiment.done.really-done"
              defaultMessage="All done!"
            />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default VoteReceipt
