import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useSelector, useDispatch } from '../../store/hooks'
import { updateStreetWidthAction as updateStreetWidth } from '../../store/actions/street'
import {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC
} from '../../users/constants'
import { updateUnits } from '../../users/localization'
import { processWidthInput, prettifyWidth } from '../../util/width_units'
import {
  MIN_CUSTOM_STREET_WIDTH,
  MAX_CUSTOM_STREET_WIDTH,
  MIN_CUSTOM_STREET_WIDTH_IMPERIAL,
  MAX_CUSTOM_STREET_WIDTH_IMPERIAL,
  STREET_WIDTH_CUSTOM,
  STREET_WIDTH_SWITCH_TO_METRIC,
  STREET_WIDTH_SWITCH_TO_IMPERIAL
} from '../constants'
import { normalizeStreetWidth } from '../width'
import StreetMetaWidthLabel from './StreetMetaWidthLabel'
import StreetMetaWidthMenu from './StreetMetaWidthMenu'

function StreetMetaWidthContainer (): React.ReactElement {
  const street = useSelector((state) => state.street)
  const editable = useSelector(
    (state) => !state.app.readOnly && state.flags.EDIT_STREET_WIDTH.value
  )
  const locale = useSelector((state) => state.locale.locale)
  const dispatch = useDispatch()
  const [isEditing, setEditing] = useState(false)
  const intl = useIntl()

  /**
   * When the street width label is clicked, only allow editing if
   * street width is not read-only
   */
  const handleClickLabel = (event: React.MouseEvent): void => {
    if (editable) {
      setEditing(true)
    }
  }

  /**
   * Handles changes to the <select> dropdown rendered in
   * <StreetMetaWidthMenu />
   */
  const handleChangeMenuSelection = (value: string): void => {
    setEditing(false)

    const { units, width, occupiedWidth } = street
    const selection = Number.parseFloat(value)

    switch (selection) {
      case STREET_WIDTH_SWITCH_TO_METRIC:
        updateUnits(SETTINGS_UNITS_METRIC)
        break
      case STREET_WIDTH_SWITCH_TO_IMPERIAL:
        updateUnits(SETTINGS_UNITS_IMPERIAL)
        break
      // Prompt for new street width
      case STREET_WIDTH_CUSTOM: {
        const minValue =
          units === SETTINGS_UNITS_IMPERIAL
            ? MIN_CUSTOM_STREET_WIDTH_IMPERIAL
            : MIN_CUSTOM_STREET_WIDTH
        const maxValue =
          units === SETTINGS_UNITS_IMPERIAL
            ? MAX_CUSTOM_STREET_WIDTH_IMPERIAL
            : MAX_CUSTOM_STREET_WIDTH
        const promptValue = normalizeStreetWidth(occupiedWidth, units)
        const promptString = intl.formatMessage(
          {
            id: 'prompt.new-width',
            defaultMessage: 'New street width (from {minWidth} to {maxWidth}):'
          },
          {
            minWidth: prettifyWidth(minValue, units, locale),
            maxWidth: prettifyWidth(maxValue, units, locale)
          }
        )
        const inputWidth = window.prompt(
          promptString,
          prettifyWidth(promptValue, units, locale)
        )

        if (inputWidth !== null) {
          const newWidth = normalizeStreetWidth(
            processWidthInput(inputWidth, units),
            units
          )
          dispatch(updateStreetWidth(newWidth))
        }

        break
      }
      // Do nothing if the selection is the original width
      case width:
        break
      // Change width to the desired selection
      default:
        if (selection) {
          dispatch(updateStreetWidth(selection))
        }
        break
    }
  }

  return (
    <div className="street-meta-width">
      {isEditing
        ? (
          <StreetMetaWidthMenu
            street={street}
            onChange={handleChangeMenuSelection}
          />
          )
        : (
          <StreetMetaWidthLabel
            street={street}
            editable={editable}
            onClick={handleClickLabel}
          />
          )}
    </div>
  )
}

export default StreetMetaWidthContainer
