import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import VoteComment from './VoteComment'
import SentimentIcon from './SentimentIcon'
import { getDataForScore } from './scores'
import './VoteReceipt.scss'

VoteReceipt.propTypes = {
  score: PropTypes.number,
  handleClose: PropTypes.func.isRequired,
  streetId: PropTypes.string
}

function VoteReceipt ({ score, handleClose, streetId }) {
  const doneEl = useRef(null)

  // When a score is received, we animate the background container
  // in first (which "fades out" the original content, then fade in
  // the new content on top of it.)
  useEffect(() => {
    if (score !== null) {
      window.setTimeout(() => {
        if (!doneEl.current) return
        doneEl.current.classList.add('visible')
        window.setTimeout(() => {
          if (!doneEl.current) return
          doneEl.current.querySelector('div').classList.add('visible')
        }, 600)
      }, 1200)
    }
  }, [score])

  if (score === null) return null

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
          <a href="/survey" className="button-like button-primary">
            <FormattedMessage
              id="sentiment.done.vote-another"
              defaultMessage="Vote on another!"
            />
          </a>
          <button className="button-tertiary" onClick={handleClose}>
            <FormattedMessage
              id="sentiment.done.really-done"
              defaultMessage="All done!"
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default VoteReceipt
