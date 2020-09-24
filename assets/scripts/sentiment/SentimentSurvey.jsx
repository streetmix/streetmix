import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { useTransition, animated, config } from 'react-spring'
import VoteButtons from './VoteButtons'
import VoteReceipt from './VoteReceipt'
import CloseButton from '../ui/CloseButton'
import { doSignIn } from '../users/authentication'
import { showDialog } from '../store/slices/dialogs'
import './SentimentSurvey.scss'

SentimentSurvey.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  handleVote: PropTypes.func.isRequired,
  streetId: PropTypes.string
}

function SentimentSurvey ({
  visible = false,
  onClose = () => {},
  handleVote,
  streetId
}) {
  const [score, setScore] = useState(null)
  const isUserSignedIn = useSelector((state) => state.user.signedIn)
  const dispatch = useDispatch()

  const transitions = useTransition(visible, null, {
    from: { transform: 'translateY(-50px)', opacity: 0 },
    enter: { transform: 'translateY(0px)', opacity: 1 },
    leave: { transform: 'translateY(-50px)', opacity: 0 },
    config: config.wobbly
  })

  const classNames = ['sentiment-survey-container']
  if (visible === true) {
    classNames.push('sentiment-survey-visible')
  }

  function handleClick (score, event) {
    // Do not handle this vote if the user is not signed in.
    // These vote buttons are normally blocked if the user is not signed in,
    // but we have to verify this in case that DOM element fails or is user-
    // edited out of existence.
    if (!isUserSignedIn) return

    setScore(score)
    handleVote(score)
  }

  function handleClickAbout (event) {
    dispatch(showDialog('SENTIMENT_SURVEY'))
  }

  function handleClickSignIn (event) {
    doSignIn()
  }

  /* eslint-disable react/jsx-indent */
  return (
    <div className={classNames.join(' ')}>
      <div className="sentiment-survey-background" />

      {transitions.map(
        ({ item, key, props }) =>
          item && (
            <animated.div
              className="sentiment-survey-dialog"
              key={key}
              style={props}
            >
              <CloseButton onClick={onClose} />
              <p>
                <FormattedMessage
                  id="sentiment.prompt.intro"
                  defaultMessage="<strong>Pardon the interruption.</strong> We’d love your feedback on this street."
                  values={{
                    strong: (chunks) => <strong>{chunks}</strong>
                  }}
                />
              </p>
              <h2>
                <FormattedMessage
                  id="sentiment.prompt.joyful"
                  defaultMessage="Would you say this street feels <em>joyful</em>?"
                  values={{
                    em: (chunks) => <em>{chunks}</em>
                  }}
                />
              </h2>
              <sub>
                {isUserSignedIn ? (
                  <FormattedMessage
                    id="sentiment.prompt.choose-one"
                    defaultMessage="(choose one)"
                  />
                ) : (
                  <FormattedMessage
                    id="sentiment.sign-in-prompt"
                    defaultMessage="Please sign in now to make your voice heard."
                  />
                )}
              </sub>
              <div className="sentiment-survey-buttons">
                <VoteButtons handleVote={handleClick} selectedScore={score} />
                {!isUserSignedIn && (
                  <div className="sentiment-survey-sign-in-prompt">
                    <button
                      className="button-primary"
                      onClick={handleClickSignIn}
                    >
                      <FormattedMessage
                        id="menu.item.sign-in"
                        defaultMessage="Sign in"
                      />
                    </button>
                  </div>
                )}
              </div>
              <p className="sentiment-survey-about-link">
                <span className="link-like" onClick={handleClickAbout}>
                  <FormattedMessage
                    id="sentiment.about-link"
                    defaultMessage="Why am I seeing this?"
                  />
                </span>
              </p>
              <VoteReceipt
                score={score}
                handleClose={onClose}
                streetId={streetId}
              />
            </animated.div>
          )
      )}
    </div>
  )
}

export default SentimentSurvey
