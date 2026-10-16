import { useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { SliceTypes } from '@streetmix/parts'

import { useSelector, useDispatch } from '~/src/store/hooks.js'
import {
  hideCoastalFloodingPanel,
  setTargetYear,
  setStormSurge,
} from '~/src/store/slices/coastmix.js'
import { segmentsChanged } from '~/src/store/actions/street.js'
import { BetaTag } from '~/src/ui/BetaTag.js'
import { Button } from '~/src/ui/Button.js'
import { Switch } from '~/src/ui/Switch.js'
import { FloatingPanel } from '~/src/ui/FloatingPanels'
import './CoastalFloodingPanel.css'

import type { FloodDetails } from '@streetmix/types'

function getAdditionalMessages(
  floodDetails: [FloodDetails | null, FloodDetails | null]
) {
  const leftFloodedTypes = floodDetails[0]?.floodedTypes ?? []
  const rightFloodedTypes = floodDetails[1]?.floodedTypes ?? []
  const allFloodedTypes = leftFloodedTypes.concat(rightFloodedTypes)
  const isFlooded = floodDetails[0]?.flooded || floodDetails[1]?.flooded
  const messages = []

  if (isFlooded) {
    // If either flood is max distance, this is the highest priority messsage
    if (
      floodDetails[0]?.distance === 'max' ||
      floodDetails[1]?.distance === 'max'
    ) {
      messages.push('The entire cross section will be flooded.')
    } else if (
      allFloodedTypes.includes(SliceTypes.CAR) ||
      allFloodedTypes.includes(SliceTypes.BIKE) ||
      allFloodedTypes.includes(SliceTypes.TRANSIT)
    ) {
      messages.push('Transportation infrastructure will be flooded.')
    } else if (allFloodedTypes.includes(SliceTypes.UTILITY)) {
      messages.push('An important utility will be flooded.')
    }

    messages.push(
      'Consider raising the height of elements near the waterfront!'
    )
  } else {
    if (
      allFloodedTypes.includes(SliceTypes.PEDESTRIAN) ||
      allFloodedTypes.includes(SliceTypes.FURNITURE) ||
      allFloodedTypes.includes(SliceTypes.FLEX)
    ) {
      messages.push('A pedestrian area will be flooded.')
      messages.push(
        'This can be acceptable during a temporary rise in sea level, such as a storm surge.'
      )
    } else if (allFloodedTypes.includes(SliceTypes.NATURE)) {
      messages.push('A natural element will be flooded.')
      messages.push(
        'This can be acceptable during a temporary rise in sea level, such as a storm surge.'
      )
    }

    if (allFloodedTypes.includes(SliceTypes.DRAINAGE)) {
      messages.push(
        'You’ve also included drainage infrastructure, which can help absorb some stormwater!'
      )
    }
  }

  return messages
}

export function CoastalFloodingPanel() {
  const coastmix = useSelector((state) => state.coastmix)
  const dispatch = useDispatch()
  const intl = useIntl()

  const { controlsVisible, targetYear, floodDetails, stormSurge } = coastmix

  function handleClose(): void {
    dispatch(hideCoastalFloodingPanel())
  }

  function changeTargetYear(x: number | null): void {
    dispatch(setTargetYear(x))
  }

  function toggleStormSurge(checked: boolean): void {
    dispatch(setStormSurge(checked))
  }

  // Updates state and saves to server
  useEffect(() => {
    dispatch(segmentsChanged(true))
  }, [targetYear, stormSurge, dispatch])

  const isFlooded = floodDetails[0]?.flooded || floodDetails[1]?.flooded

  let message
  let additionalMessages: string[] = []

  const messageClassNames = ['flood-controls-message']
  if (targetYear === null && stormSurge === false) {
    message = `👉 ${intl.formatMessage({ id: 'tools.flooding.messages.start', defaultMessage: 'Select a sea level rise target to visualize flooding.' })}`
  } else if (floodDetails[0] === null && floodDetails[1] === null) {
    message = `👉 ${intl.formatMessage({ id: 'tools.flooding.messages.need-waterfront', defaultMessage: 'Add a waterfront boundary to visualize flooding.' })}`
  } else {
    if (isFlooded) {
      message = `❌ ${intl.formatMessage({ id: 'tools.flooding.messages.fail', defaultMessage: 'This configuration does not address sea level rise!' })}`
      messageClassNames.push('flood-controls-warning')
    } else {
      message = `✅ ${intl.formatMessage({ id: 'tools.flooding.messages.success', defaultMessage: 'This configuration addresses sea level rise!' })}`
      messageClassNames.push('flood-controls-success')
    }

    additionalMessages = getAdditionalMessages(floodDetails)
  }

  return (
    <FloatingPanel
      icon="boat"
      title={
        <>
          <FormattedMessage
            id="tools.flooding.heading"
            defaultMessage="Coastal flooding"
          />
          <BetaTag />
        </>
      }
      show={controlsVisible}
      className="coastmix-controls"
      handleClose={handleClose}
    >
      <div className="popup-controls flood-controls-content">
        <div className="popup-control-group" data-tour-id="sea-level-control">
          <div className="popup-control-label">
            <FormattedMessage
              id="tools.sea-level.label"
              defaultMessage="Sea level rise"
            />
          </div>
          <div>
            <Button
              className={`sea-level-button${targetYear === null ? ' sea-level-selected' : ''}`}
              onClick={() => {
                changeTargetYear(null)
              }}
            >
              <FormattedMessage
                id="tools.sea-level.current"
                defaultMessage="Current"
              />
            </Button>
            {/* eslint-disable formatjs/no-literal-string-in-jsx */}
            <Button
              className={`sea-level-button${targetYear === 2030 ? ' sea-level-selected' : ''}`}
              data-tour-id="2030-sea-level-rise"
              onClick={() => {
                changeTargetYear(2030)
              }}
            >
              2030
            </Button>
            <Button
              className={`sea-level-button${targetYear === 2050 ? ' sea-level-selected' : ''}`}
              onClick={() => {
                changeTargetYear(2050)
              }}
            >
              2050
            </Button>
            <Button
              className={`sea-level-button${targetYear === 2070 ? ' sea-level-selected' : ''}`}
              onClick={() => {
                changeTargetYear(2070)
              }}
            >
              2070
            </Button>
            {/* eslint-enable formatjs/no-literal-string-in-jsx */}
          </div>
        </div>
        <div className="popup-control-group" data-tour-id="storm-surge-control">
          <div className="popup-control-label">
            <FormattedMessage
              id="tools.storm-surge.label"
              defaultMessage="Storm surge"
            />
          </div>
          <Switch onCheckedChange={toggleStormSurge} checked={stormSurge} />
        </div>
        <div
          className={messageClassNames.join(' ')}
          data-tour-id="flooding-message"
        >
          {message}
          {additionalMessages.length > 0 && (
            <p className="flood-controls-message-explainer">
              {additionalMessages.join(' ')}
            </p>
          )}
        </div>
      </div>
    </FloatingPanel>
  )
}
