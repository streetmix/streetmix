import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ICON_LOCK } from '../../ui/icons'
import Slider from '../../ui/Slider'
import Tooltip from '../../ui/Tooltip'
import { SETTINGS_UNITS_METRIC } from '../../users/constants'
import './CustomScale.scss'

const MIN_IMAGE_MULTIPLIER = 1
const MAX_IMAGE_MULTIPLIER = 5

function CustomScale ({ scale, baseDimensions = {}, onChange = () => {} }) {
  const units = useSelector((state) => state.settings.units)
  const allowCustomScale = useSelector(
    (state) => state.flags.SAVE_AS_IMAGE_CUSTOM_DPI.value
  )
  const intl = useIntl()
  const { width = 0, height = 0 } = baseDimensions

  function handleChangeScale ([value]) {
    // Make sure value is within range
    const scale = Math.min(
      Math.max(MIN_IMAGE_MULTIPLIER, value),
      MAX_IMAGE_MULTIPLIER
    )

    onChange(scale)
  }

  const classNames = ['custom-scale']
  if (!allowCustomScale) {
    classNames.push('custom-scale-disabled')
  }

  // TODO: Metric unit scale should not use dpi but dots per cm?
  return (
    <div className={classNames.join(' ')}>
      <div className="custom-scale-label">
        <FormattedMessage
          id="dialogs.save.option-custom-scale"
          defaultMessage="Custom scale"
        />
        {!allowCustomScale && (
          <FontAwesomeIcon icon={ICON_LOCK} style={{ margin: '0 0.25em' }} />
        )}
      </div>
      <div className="custom-scale-control">
        {/* eslint-disable-next-line multiline-ternary -- Formatting conflicts with prettier */}
        {allowCustomScale ? (
          <Slider
            id="custom-scale"
            min={MIN_IMAGE_MULTIPLIER}
            max={MAX_IMAGE_MULTIPLIER}
            step={0.25}
            value={[scale]}
            onValueChange={handleChangeScale}
          />
        ) : (
          <Tooltip
            label={intl.formatMessage({
              id: 'plus.locked.sub',
              // Default message ends with a Unicode-only left-right order mark
              // to allow for proper punctuation in `rtl` text direction
              // This character is hidden from editors by default!
              defaultMessage: 'Upgrade to Streetmix+ to use!‎'
            })}
          >
            <Slider
              id="custom-scale"
              min={MIN_IMAGE_MULTIPLIER}
              max={MAX_IMAGE_MULTIPLIER}
              step={0.25}
              value={[scale]}
              disabled={true}
            />
          </Tooltip>
        )}
        <div
          className={`custom-scale-info ${
            allowCustomScale ? '' : 'custom-scale-info-disabled'
          }`}
        >
          <strong>{scale * 100}%</strong> &mdash;&nbsp;
          <FormattedMessage
            id="dialogs.save.digital-size"
            defaultMessage="Digital size"
          />
          : {Math.floor(width * scale)} px ⨯ {Math.floor(height * scale)} px
          &mdash;&nbsp;
          <FormattedMessage
            id="dialogs.save.print-size"
            defaultMessage="Print size"
          />
          :{' '}
          {units === SETTINGS_UNITS_METRIC
            ? `${(((width * scale) / 300) * 2.54).toFixed(2)} cm ⨯ ${(
                ((height * scale) / 300) *
                2.54
              ).toFixed(2)} cm`
            : `${((width * scale) / 300).toFixed(2)}″ ⨯ ${(
                (height * scale) /
                300
              ).toFixed(2)}″`}{' '}
          (300 dpi)
        </div>
      </div>
    </div>
  )
}

CustomScale.propTypes = {
  scale: PropTypes.number.isRequired,
  baseDimensions: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number
  }).isRequired,
  onChange: PropTypes.func
}

export default CustomScale
