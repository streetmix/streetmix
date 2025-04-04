import IMG_SENTIMENT_1 from 'url:../../images/openmoji/color/1F620.svg'
import IMG_SENTIMENT_2 from 'url:../../images/openmoji/color/1F641.svg'
import IMG_SENTIMENT_3 from 'url:../../images/openmoji/color/1F610.svg'
import IMG_SENTIMENT_4 from 'url:../../images/openmoji/color/1F60A.svg'
import IMG_SENTIMENT_5 from 'url:../../images/openmoji/color/1F60D.svg'

interface ScoreData {
  score: number
  label: {
    localizationKey: string
    defaultMessage: string
  }
  imgSrc: string
  className: string
}

const SCORE_DATA: ScoreData[] = [
  {
    score: -1,
    label: {
      localizationKey: 'sentiment.answer.rating-1',
      defaultMessage: 'Absolutely not'
    },
    imgSrc: IMG_SENTIMENT_1,
    className: 'sentiment-1'
  },
  {
    score: -0.5,
    label: {
      localizationKey: 'sentiment.answer.rating-2',
      defaultMessage: 'Not very much'
    },
    imgSrc: IMG_SENTIMENT_2,
    className: 'sentiment-2'
  },
  {
    score: 0,
    label: {
      localizationKey: 'sentiment.answer.rating-3',
      defaultMessage: 'It’s so-so'
    },
    imgSrc: IMG_SENTIMENT_3,
    className: 'sentiment-3'
  },
  {
    score: 0.5,
    label: {
      localizationKey: 'sentiment.answer.rating-4',
      defaultMessage: 'A little bit'
    },
    imgSrc: IMG_SENTIMENT_4,
    className: 'sentiment-4'
  },
  {
    score: 1,
    label: {
      localizationKey: 'sentiment.answer.rating-5',
      defaultMessage: 'Quite a lot'
    },
    imgSrc: IMG_SENTIMENT_5,
    className: 'sentiment-5'
  }
]

export function getDataForScore (score: number): ScoreData {
  const data = SCORE_DATA.find((d) => d.score === score)

  // .find() can return `undefined`, we should never see it
  if (data === undefined) {
    throw new TypeError('Score data is undefined')
  }

  return data
}

export function getAllScoreData (): ScoreData[] {
  return SCORE_DATA
}
