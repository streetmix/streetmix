import React from 'react'
import { useIntl } from 'react-intl'

import Tooltip, { useSingleton } from '../ui/Tooltip'
import SentimentIcon from './SentimentIcon'
import { getAllScoreData } from './scores'

interface VoteButtonsProps {
  handleVote: (score: number) => void
  selectedScore?: number
}

function VoteButtons ({
  handleVote,
  selectedScore
}: VoteButtonsProps): React.ReactElement {
  const [source, target] = useSingleton()
  const intl = useIntl()

  return (
    <>
      <Tooltip placement="bottom" source={source} />
      {getAllScoreData().map((vote) => {
        const label = intl.formatMessage({
          id: vote.label.localizationKey,
          defaultMessage: vote.label.defaultMessage
        })

        return (
          <Tooltip key={vote.score} label={label} target={target}>
            <button
              className={[
                'sentiment-button',
                selectedScore === vote.score ? 'sentiment-selected' : ''
              ]
                .join(' ')
                .trim()}
              onClick={() => {
                handleVote(vote.score)
              }}
              disabled={selectedScore !== null}
            >
              <SentimentIcon {...vote} />
            </button>
          </Tooltip>
        )
      })}
    </>
  )
}

export default VoteButtons
