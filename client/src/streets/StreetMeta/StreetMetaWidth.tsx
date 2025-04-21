import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { updateStreetWidthAction as updateStreetWidth } from '~/src/store/actions/street'
import Icon from '~/src/ui/Icon'
import {
  prettifyWidth,
  processWidthInput,
  convertImperialMeasurementToMetric
} from '~/src/util/width_units'
import {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC
} from '~/src/users/constants'
import { updateUnits } from '~/src/users/localization'
import {
  MIN_CUSTOM_STREET_WIDTH,
  MAX_CUSTOM_STREET_WIDTH,
  MIN_CUSTOM_STREET_WIDTH_IMPERIAL,
  MAX_CUSTOM_STREET_WIDTH_IMPERIAL
} from '../constants'
import { normalizeStreetWidth } from '../width'
import StreetMetaItem from './StreetMetaItem'

import type { StreetJsonExtra } from '@streetmix/types'
import './StreetMetaWidth.css'

const DEFAULT_STREET_WIDTHS_IMPERIAL = [40, 60, 80].map(
  convertImperialMeasurementToMetric
)
const DEFAULT_STREET_WIDTHS_METRIC = [12, 18, 24]

function StreetMetaWidthNew (): React.ReactElement | null {
  const street = useSelector((state) => state.street)
  const editable = useSelector(
    (state) => !state.app.readOnly && state.flags.EDIT_STREET_WIDTH.value
  )
  const locale = useSelector((state) => state.locale.locale)
  const dispatch = useDispatch()
  const width = prettifyWidth(street.width, street.units, locale)

  // A title attribute is provided only when street width is editable
  const intl = useIntl()
  const tooltip = intl.formatMessage({
    id: 'tooltip.street-width',
    defaultMessage: 'Change width of the street'
  })

  // Apply a class when street width is editable for styling
  let className = 'street-width'
  if (editable) {
    className += ' street-width-editable'
  }

  const { units, occupiedWidth } = street
  const defaultWidths =
    units === SETTINGS_UNITS_IMPERIAL
      ? DEFAULT_STREET_WIDTHS_IMPERIAL
      : DEFAULT_STREET_WIDTHS_METRIC

  function renderStreetWidthRemaining (
    { remainingWidth, units }: StreetJsonExtra,
    locale: string
  ): React.ReactElement | null {
    const width = prettifyWidth(Math.abs(remainingWidth), units, locale)

    if (remainingWidth > 0) {
      return (
        <span className="street-width-under">
          <FormattedMessage
            id="width.under"
            defaultMessage="({width} room)"
            values={{ width }}
          />
        </span>
      )
    } else if (remainingWidth < 0) {
      return (
        <span className="street-width-over">
          <FormattedMessage
            id="width.over"
            defaultMessage="({width} over)"
            values={{ width }}
          />
        </span>
      )
    }

    return null
  }

  function handleWidthChange (value: string): void {
    const newWidth = Number.parseFloat(value)

    // Do nothing if the selection is the original width
    if (newWidth === street.width) return

    // Change width to the desired selection
    if (newWidth) {
      void dispatch(updateStreetWidth(newWidth))
    }
  }

  function handleUnitChange (value: string): void {
    const selection = Number.parseFloat(value)
    updateUnits(selection)
  }

  function handleWidthEntry (): void {
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

    // Ignore if input is cancelled or blank
    if (inputWidth === null || inputWidth === '') {
      return
    }

    const newWidth = normalizeStreetWidth(
      processWidthInput(inputWidth, units),
      units
    )

    void dispatch(updateStreetWidth(newWidth))
  }

  const DefaultWidthOptions = (): React.ReactElement[] =>
    defaultWidths.map((width) => (
      <DropdownMenu.RadioItem
        className="dropdown-menu-radio-item"
        value={width.toString()}
        key={width}
      >
        <DropdownMenu.ItemIndicator className="dropdown-menu-item-indicator">
          <Icon name="check" />
        </DropdownMenu.ItemIndicator>
        {prettifyWidth(width, units, locale)}
      </DropdownMenu.RadioItem>
    ))

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <StreetMetaItem
          className={className}
          isEditable={editable}
          icon={<Icon name="ruler" />}
          tooltip={tooltip}
        >
          <span className="underline">
            <FormattedMessage
              id="width.label"
              defaultMessage="{width} width"
              values={{ width }}
            />
          </span>
          {renderStreetWidthRemaining(street, locale)}
          {editable && <Icon name="chevron-down" className="menu-carat-down" />}
        </StreetMetaItem>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="dropdown-menu-content">
          <DropdownMenu.Label className="dropdown-menu-label">
            <FormattedMessage
              id="width.occupied"
              defaultMessage="Occupied width"
            />
          </DropdownMenu.Label>
          <DropdownMenu.Item className="dropdown-menu-item" disabled>
            {/* If width is U.S. customary and fractional, force `ltr` for proper display */}
            <span dir={units === 1 ? 'ltr' : undefined}>
              {prettifyWidth(occupiedWidth, units, locale)}
            </span>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="menu-separator" />

          <DropdownMenu.Label className="dropdown-menu-label">
            <FormattedMessage
              id="width.building"
              defaultMessage="Building-to-building width"
            />
          </DropdownMenu.Label>

          <DropdownMenu.RadioGroup
            value={street.width.toString()}
            onValueChange={handleWidthChange}
          >
            <DefaultWidthOptions />

            {/* If the street width doesn't match any of the default widths,
            // render another choice representing the current width */}
            {!defaultWidths.includes(street.width) && (
              <DropdownMenu.RadioItem
                className="dropdown-menu-radio-item"
                value={street.width.toString()}
                style={{ marginTop: '1em' }}
              >
                <DropdownMenu.ItemIndicator className="dropdown-menu-item-indicator">
                  <Icon name="check" />
                </DropdownMenu.ItemIndicator>
                <span dir={units === 1 ? 'ltr' : undefined}>
                  {prettifyWidth(street.width, units, locale)}
                </span>
              </DropdownMenu.RadioItem>
            )}
          </DropdownMenu.RadioGroup>

          <DropdownMenu.Item
            className="dropdown-menu-item"
            onSelect={handleWidthEntry}
          >
            <FormattedMessage
              id="width.different"
              defaultMessage="Different width…&lrm;"
            />
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="menu-separator" />

          <DropdownMenu.Label className="dropdown-menu-label">
            <FormattedMessage id="width.units" defaultMessage="Units" />
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup
            value={units.toString()}
            onValueChange={handleUnitChange}
          >
            <DropdownMenu.RadioItem
              className="dropdown-menu-radio-item"
              value={SETTINGS_UNITS_METRIC.toString()}
            >
              <DropdownMenu.ItemIndicator className="dropdown-menu-item-indicator">
                <Icon name="check" />
              </DropdownMenu.ItemIndicator>
              <FormattedMessage id="width.metric" defaultMessage="Metric" />
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem
              className="dropdown-menu-radio-item"
              value={SETTINGS_UNITS_IMPERIAL.toString()}
            >
              <DropdownMenu.ItemIndicator className="dropdown-menu-item-indicator">
                <Icon name="check" />
              </DropdownMenu.ItemIndicator>
              <FormattedMessage
                id="width.imperial"
                defaultMessage="U.S. customary / imperial"
              />
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>

          <DropdownMenu.Arrow className="dropdown-menu-arrow" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default StreetMetaWidthNew
