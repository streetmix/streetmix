import { useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { SliceTypes } from '@streetmix/parts'
import { useSelector, useDispatch } from '~/src/store/hooks.js'
import {
  hideCoastalFloodingPanel,
  setSeaLevelRise,
  setStormSurge,
} from '~/src/store/slices/coastmix.js'
import { segmentsChanged } from '~/src/store/actions/street.js'
import { BetaTag } from '~/src/ui/BetaTag.js'
import { Button } from '~/src/ui/Button.js'
import { Switch } from '~/src/ui/Switch.js'
import { FloatingPanel } from '~/src/ui/FloatingPanel.js'
import './CoastalFloodingPanel.css'

export function CoastalFloodingPanel() {
  const coastmix = useSelector((state) => state.coastmix)
  const dispatch = useDispatch()
  const intl = useIntl()

  const { controlsVisible, seaLevelRise, floodDetails, stormSurge } = coastmix

  function handleClose(): void {
    dispatch(hideCoastalFloodingPanel())
  }

  function changeSeaLevelRise(x: number): void {
    dispatch(setSeaLevelRise(x))
  }

  function toggleStormSurge(checked: boolean): void {
    dispatch(setStormSurge(checked))
  }

  // Updates state and saves to server
  useEffect(() => {
    dispatch(segmentsChanged(true))
  }, [seaLevelRise, stormSurge, dispatch])

  const isFlooded = floodDetails[0]?.flooded || floodDetails[1]?.flooded

  let message
  const message2 = []

  const messageClassNames = ['flood-controls-message']
  if (seaLevelRise === 0 && stormSurge === false) {
    message = `👉 ${intl.formatMessage({ id: 'tools.flooding.messages.start', defaultMessage: 'Select a sea level rise target to visualize flooding.' })}`
  } else if (floodDetails[0] === null && floodDetails[1] === null) {
    message = `👉 ${intl.formatMessage({ id: 'tools.flooding.messages.need-waterfront', defaultMessage: 'Add a waterfront boundary to visualize flooding.' })}`
  } else {
    const leftFloodedTypes = floodDetails[0]?.floodedTypes ?? []
    const rightFloodedTypes = floodDetails[1]?.floodedTypes ?? []
    const allFloodedTypes = leftFloodedTypes.concat(rightFloodedTypes)

    if (isFlooded) {
      message = `❌ ${intl.formatMessage({ id: 'tools.flooding.messages.fail', defaultMessage: 'This configuration does not address sea level rise!' })}`
      messageClassNames.push('flood-controls-warning')

      if (
        allFloodedTypes.includes(SliceTypes.CAR) ||
        allFloodedTypes.includes(SliceTypes.BIKE) ||
        allFloodedTypes.includes(SliceTypes.TRANSIT)
      ) {
        message2.push(
          'Transportation infrastructure is being flooded and that could be pretty sucky.'
        )
      }
    } else {
      message = `✅ ${intl.formatMessage({ id: 'tools.flooding.messages.success', defaultMessage: 'This configuration is addressing sea level rise!' })}`
      messageClassNames.push('flood-controls-success')

      if (allFloodedTypes.includes(SliceTypes.NATURE)) {
        message2.push('A natural element is being flooded, but thats okay.')
      }

      if (
        allFloodedTypes.includes(SliceTypes.PEDESTRIAN) ||
        allFloodedTypes.includes(SliceTypes.FURNITURE)
      ) {
        message2.push(
          'A pedestrian area is being flooded, but that could be acceptable temporarily.'
        )
      }

      if (allFloodedTypes.includes(SliceTypes.DRAINAGE)) {
        message2.push('You have also included drainage infra and that helps!')
      }
    }
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
              className={`sea-level-button${seaLevelRise === 0 ? ' sea-level-selected' : ''}`}
              onClick={() => {
                changeSeaLevelRise(0)
              }}
            >
              <FormattedMessage
                id="tools.sea-level.current"
                defaultMessage="Current"
              />
            </Button>
            <Button
              className={`sea-level-button${seaLevelRise === 2030 ? ' sea-level-selected' : ''}`}
              data-tour-id="2030-sea-level-rise"
              onClick={() => {
                changeSeaLevelRise(2030)
              }}
            >
              2030
            </Button>
            <Button
              className={`sea-level-button${seaLevelRise === 2050 ? ' sea-level-selected' : ''}`}
              onClick={() => {
                changeSeaLevelRise(2050)
              }}
            >
              2050
            </Button>
            <Button
              className={`sea-level-button${seaLevelRise === 2070 ? ' sea-level-selected' : ''}`}
              onClick={() => {
                changeSeaLevelRise(2070)
              }}
            >
              2070
            </Button>
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
          {message2.length > 0 && (
            <p
              style={{
                fontWeight: 'normal',
                whiteSpace: 'normal',
                width: '350px',
                margin: 0,
                marginTop: '0.25em',
              }}
            >
              {message2.join(' ')}
            </p>
          )}
        </div>
      </div>
    </FloatingPanel>
  )
}
