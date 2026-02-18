import { useState, useEffect } from 'react'

import { useSelector } from '../store/hooks.js'
import { postSentimentSurveyVote } from '../util/api.js'
import { SentimentSurvey } from './SentimentSurvey.js'

const SURVEY_DELAY_BEFORE_APPEAR = 5000 // in ms

export function SentimentSurveyContainer() {
  const [isVisible, setVisible] = useState(false)
  const [isDismissed, setDismissed] = useState(false)
  const [streetId, setStreetId] = useState<string>()
  const street = useSelector((state) => state.street)
  const isEnabled = useSelector(
    (state) =>
      // Enabled when the feature flag is true
      state.flags.SENTIMENT_SURVEY?.value &&
      // Enabled if locale is English (or any other supported locale; for
      // now, this is going to be hard-coded when needed)
      ['en', 'es-419'].includes(state.locale.locale) &&
      // Show if user is not the same the current street's creator
      state.user.signInData?.userId !== street.creatorId &&
      // Show if gallery is not open
      !state.gallery.visible &&
      // Show if the street is geolocated
      street.location !== null &&
      // Show if the street has had more than a number of edits to it
      street.editCount > 10 &&
      // Show if the street segments fit street width exactly
      street.remainingWidth === 0
  )

  useEffect(() => {
    if (!isDismissed) {
      window.setTimeout(() => {
        setVisible(true)
      }, SURVEY_DELAY_BEFORE_APPEAR)
    }
    // only re-run the effect if the value of isDismissed has changed
    // previously, the useEffect hook was getting called several times
  }, [isDismissed])

  function handleClose(): void {
    setDismissed(true)
    setVisible(false)
  }

  async function handleVote(score: number): Promise<void> {
    // Post the vote information immediately
    // Let's allow this to fail silently (if there is a problem, the user
    // doesn't need to know, but we still log the error internally)
    try {
      const response = await postSentimentSurveyVote({
        score,
        data: street,
        streetId: street.id,
      })
      if (response.status === 200) {
        setStreetId(response.data.savedBallot.id as string)
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (isEnabled && streetId !== undefined) {
    return (
      <SentimentSurvey
        visible={isVisible}
        onClose={handleClose}
        handleVote={handleVote}
        streetId={streetId}
      />
    )
  }

  return null
}
