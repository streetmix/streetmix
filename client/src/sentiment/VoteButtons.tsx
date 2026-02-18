import { useIntl } from 'react-intl'

import { Tooltip, TooltipGroup } from '../ui/Tooltip.js'
import { SentimentIcon } from './SentimentIcon.js'
import { getAllScoreData } from './scores.js'

interface VoteButtonsProps {
  handleVote: (score: number) => void
  selectedScore?: number
}

export function VoteButtons({ handleVote, selectedScore }: VoteButtonsProps) {
  const intl = useIntl()

  return (
    <TooltipGroup>
      {getAllScoreData().map((vote) => {
        const label = intl.formatMessage({
          id: vote.label.localizationKey,
          defaultMessage: vote.label.defaultMessage,
        })

        return (
          <Tooltip key={vote.score} label={label} placement="bottom">
            <button
              className={[
                'sentiment-button',
                selectedScore === vote.score ? 'sentiment-selected' : '',
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
    </TooltipGroup>
  )
}
