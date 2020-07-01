import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, useIntl } from 'react-intl'
import find from 'lodash/find'
import IMG_SENTIMENT_1 from '../../images/openmoji/color/1F620.svg'
import IMG_SENTIMENT_2 from '../../images/openmoji/color/1F641.svg'
import IMG_SENTIMENT_3 from '../../images/openmoji/color/1F610.svg'
import IMG_SENTIMENT_4 from '../../images/openmoji/color/1F60A.svg'
import IMG_SENTIMENT_5 from '../../images/openmoji/color/1F60D.svg'

VoteReceipt.propTypes = {
  score: PropTypes.number,
  handleClose: PropTypes.func.isRequired
}

function VoteReceipt ({ score, handleClose }) {
  const doneEl = useRef(null)
  const intl = useIntl()

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

  // TODO: Don't duplicate button data from <VoteButtons />
  const voteButtonData = [
    {
      score: -1,
      label: intl.formatMessage({
        id: 'sentiment.answer.rating-1',
        defaultMessage: 'Absolutely not'
      }),
      imgSrc: IMG_SENTIMENT_1,
      className: 'sentiment-1'
    },
    {
      score: -0.5,
      label: intl.formatMessage({
        id: 'sentiment.answer.rating-2',
        defaultMessage: 'Not very much'
      }),
      imgSrc: IMG_SENTIMENT_2,
      className: 'sentiment-2'
    },
    {
      score: 0,
      label: intl.formatMessage({
        id: 'sentiment.answer.rating-3',
        defaultMessage: 'It’s so-so'
      }),
      imgSrc: IMG_SENTIMENT_3,
      className: 'sentiment-3'
    },
    {
      score: 0.5,
      label: intl.formatMessage({
        id: 'sentiment.answer.rating-4',
        defaultMessage: 'A little bit'
      }),
      imgSrc: IMG_SENTIMENT_4,
      className: 'sentiment-4'
    },
    {
      score: 1,
      label: intl.formatMessage({
        id: 'sentiment.answer.rating-5',
        defaultMessage: 'Quite a lot'
      }),
      imgSrc: IMG_SENTIMENT_5,
      className: 'sentiment-5'
    }
  ]

  if (score === null) return null

  const vote = find(voteButtonData, { score })

  return (
    <div className="sentiment-survey-done-container" ref={doneEl}>
      <div className="sentiment-survey-done-content">
        <h2>
          <FormattedMessage
            id="sentiment.thank-you"
            defaultMessage="Thank you for participating in this survey!"
          />
        </h2>
        <div className="sentiment-survey-done-receipt">
          <div className="sentiment-survey-buttons">
            <div className={`sentiment-button ${vote.className}`}>
              <img src={vote.imgSrc} draggable="false" alt={vote.label} />
            </div>
          </div>
          <div className="sentiment-survey-done-text">
            <p>
              <strong>
                <FormattedMessage
                  id="sentiment.prompt.joyful"
                  defaultMessage="Would you say this street feels <em>joyful</em>?"
                  values={{
                    em: (...chunks) => <em>{chunks}</em>
                  }}
                />
              </strong>
            </p>
            <p>
              <FormattedMessage
                id="sentiment.done.response"
                defaultMessage="You responded {score}. Your response will help us learn how people feel about streets!"
                values={{
                  score: <strong>{vote.label}</strong>
                }}
              />
            </p>
          </div>
        </div>
        <p style={{ display: 'none' }}>
          Tell us why:
          <input
            type="text"
            placeholder="(for instance, “I liked the trees.”)"
          />
          <button className="button-secondary">Send</button>
        </p>
        <div className="sentiment-survey-done-buttons">
          <a href="/survey" className="button-like button-primary">
            <FormattedMessage
              id="sentiment.done.vote-another"
              defaultMessage="Vote on another!"
            />
          </a>
          <button className="button-primary" onClick={handleClose}>
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
