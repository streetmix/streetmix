import React from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import Tooltip, { useSingleton } from '../ui/Tooltip'
import VoteButton from './VoteButton'
import IMG_SENTIMENT_1 from '../../images/openmoji/color/1F620.svg'
import IMG_SENTIMENT_2 from '../../images/openmoji/color/1F641.svg'
import IMG_SENTIMENT_3 from '../../images/openmoji/color/1F610.svg'
import IMG_SENTIMENT_4 from '../../images/openmoji/color/1F60A.svg'
import IMG_SENTIMENT_5 from '../../images/openmoji/color/1F60D.svg'

VoteButtons.propTypes = {
  handleVote: PropTypes.func.isRequired,
  selectedScore: PropTypes.number
}

function VoteButtons ({ handleVote, selectedScore }) {
  const [source, target] = useSingleton()
  const intl = useIntl()

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

  return (
    <>
      <Tooltip placement="bottom" source={source} />
      {voteButtonData.map((props) => (
        /* eslint-disable react/prop-types */
        <VoteButton
          {...props}
          key={props.score}
          disabled={selectedScore !== null}
          className={[
            props.className,
            selectedScore === props.score ? 'sentiment-selected' : ''
          ].join(' ')}
          onClick={handleVote}
          tooltipTarget={target}
        />
        /* eslint-enable react/prop-types */
      ))}
    </>
  )
}

export default VoteButtons
