import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, useIntl } from 'react-intl'
import { useTransition, animated, config } from 'react-spring'
import Tooltip, { useSingleton } from '../ui/Tooltip'
import CloseButton from '../ui/CloseButton'
import VoteButton from './VoteButton'
import './SentimentSurvey.scss'
import IMG_SENTIMENT_1 from '../../images/openmoji/color/1F620.svg'
import IMG_SENTIMENT_2 from '../../images/openmoji/color/1F641.svg'
import IMG_SENTIMENT_3 from '../../images/openmoji/color/1F610.svg'
import IMG_SENTIMENT_4 from '../../images/openmoji/color/1F60A.svg'
import IMG_SENTIMENT_5 from '../../images/openmoji/color/1F60D.svg'

SentimentSurvey.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  handleVote: PropTypes.func.isRequired
}

function SentimentSurvey ({ visible = false, onClose = () => {}, handleVote }) {
  const intl = useIntl()
  const [source, target] = useSingleton()
  const transitions = useTransition(visible, null, {
    from: { transform: 'translateY(200px)' },
    enter: { transform: 'translateY(0)' },
    leave: { transform: 'translateY(300px)' },
    config: config.wobbly
  })

  const classNames = ['sentiment-survey-container']
  if (visible === true) {
    classNames.push('sentiment-survey-visible')
  }

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

  function handleClick (score, event) {
    handleVote(score)
  }

  /* eslint-disable react/jsx-indent */
  return (
    <div className={classNames.join(' ')}>
      <div className="sentiment-survey-background" />
      <Tooltip placement="bottom" source={source} />

      {transitions.map(
        ({ item, key, props }) =>
          item && (
            <animated.div
              className="sentiment-survey-dialog"
              key={key}
              style={props}
            >
              <CloseButton onClick={onClose} />
              <h2>
                <FormattedMessage
                  id="sentiment.prompt.joyful"
                  defaultMessage="How <em>joyful</em> is this street?"
                  values={{
                    em: (...chunks) => <em>{chunks}</em>
                  }}
                />
              </h2>
              <div className="sentiment-survey-buttons">
                {voteButtonData.map((props) => (
                  <VoteButton
                    {...props}
                    key={props.score} // eslint-disable-line react/prop-types
                    onClick={handleClick}
                    tooltipTarget={target}
                  />
                ))}
              </div>
              <p>
                <FormattedMessage
                  id="sentiment.about-text"
                  defaultMessage="This survey helps Streetmix learn how people feel about streets."
                />
              </p>
            </animated.div>
          )
      )}
    </div>
  )
}

export default SentimentSurvey
