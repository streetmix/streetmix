import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useTransition, animated, config } from '@react-spring/web'

import { useSelector, useDispatch } from '../store/hooks.js'
import { showDialog } from '../store/slices/dialogs.js'
import { Button } from '../ui/Button.js'
import { CloseButton } from '../ui/CloseButton.js'
import { doSignIn } from '../users/authentication.js'
import VoteReceipt from './VoteReceipt.js'
import VoteButtons from './VoteButtons.js'
import './SentimentSurvey.css'

interface SentimentSurveyProps {
  visible: boolean
  onClose: React.MouseEventHandler
  handleVote: (score: number) => void
  streetId: string
}

function SentimentSurvey({
  visible = false,
  onClose = () => {},
  handleVote,
  streetId,
}: SentimentSurveyProps) {
  const [score, setScore] = useState<number>()
  const isUserSignedIn = useSelector((state) => state.user.signedIn)
  const dispatch = useDispatch()

  const transitions = useTransition(visible, {
    from: { y: -50, opacity: 0 },
    enter: { y: 0, opacity: 1 },
    leave: { y: -50, opacity: 0 },
    config: config.wobbly,
  })

  const classNames = ['sentiment-survey-container']
  if (visible) {
    classNames.push('sentiment-survey-visible')
  }

  function handleClick(score: number): void {
    // Do not handle this vote if the user is not signed in.
    // These vote buttons are normally blocked if the user is not signed in,
    // but we have to verify this in case that DOM element fails or is user-
    // edited out of existence.
    if (!isUserSignedIn) return

    setScore(score)
    handleVote(score)
  }

  function handleClickAbout(): void {
    dispatch(showDialog('SENTIMENT_SURVEY'))
  }

  function handleClickSignIn(): void {
    doSignIn()
  }

  return (
    <div className={classNames.join(' ')}>
      <div className="sentiment-survey-background" />

      {transitions(
        (style, item) =>
          item && (
            <animated.div className="sentiment-survey-dialog" style={style}>
              <CloseButton onClick={onClose} />
              <p>
                <FormattedMessage
                  id="sentiment.prompt.intro"
                  defaultMessage="<strong>Pardon the interruption.</strong> We’d love your feedback on this street."
                  values={{
                    strong: (chunks) => <strong>{chunks}</strong>,
                  }}
                />
              </p>
              <h2>
                <FormattedMessage
                  id="sentiment.prompt.joyful"
                  defaultMessage="Would you say this street feels <em>joyful</em>?"
                  values={{
                    em: (chunks) => <em>{chunks}</em>,
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
                    <Button primary onClick={handleClickSignIn}>
                      <FormattedMessage
                        id="menu.item.sign-in"
                        defaultMessage="Sign in"
                      />
                    </Button>
                  </div>
                )}
              </div>
              <p className="sentiment-survey-about-link">
                <button className="link-like" onClick={handleClickAbout}>
                  <FormattedMessage
                    id="sentiment.about-link"
                    defaultMessage="Why am I seeing this?"
                  />
                </button>
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
