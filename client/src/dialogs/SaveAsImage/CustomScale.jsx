import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import Popover from '../../ui/Popover'
import Slider from '../../ui/Slider'
import StreetmixPlusPrompt from '../../app/StreetmixPlusPrompt.tsx'

import { SETTINGS_UNITS_METRIC } from '../../users/constants'
import './CustomScale.scss'

const MIN_IMAGE_MULTIPLIER = 1
const MAX_IMAGE_MULTIPLIER = 5

function CustomScale ({ scale, baseDimensions = {}, onChange = () => {} }) {
  const units = useSelector((state) => state.settings.units)
  const allowCustomScale = useSelector(
    (state) => state.flags.SAVE_AS_IMAGE_CUSTOM_DPI.value
  )
  const { width = 0, height = 0 } = baseDimensions

  function handleChangeScale ([value]) {
    if (!allowCustomScale) return

    // Make sure value is within range
    const scale = Math.min(
      Math.max(MIN_IMAGE_MULTIPLIER, value),
      MAX_IMAGE_MULTIPLIER
    )

    onChange(scale)
  }

  const classNames = ['custom-scale-control']
  if (!allowCustomScale) {
    classNames.push('custom-scale-disabled')
  }

  const description = (
    <FormattedMessage
      id="dialogs.save.option-custom-scale.description"
      defaultMessage="Download image up to 500% of original size."
    />
  )

  // TODO: Metric unit scale should not use dpi but dots per cm?
  return (
    <div className="custom-scale">
      <div className="custom-scale-label">
        <FormattedMessage
          id="dialogs.save.option-custom-scale"
          defaultMessage="Custom scale"
        />
        <span className="custom-scale-popover">
          <Popover>
            {/* eslint-disable-next-line */}
            {!allowCustomScale ? (
              <StreetmixPlusPrompt>{description}</StreetmixPlusPrompt>
            ) : (
              description
            )}
          </Popover>
        </span>
      </div>
      <div className={classNames.join(' ')}>
        <Slider
          id="custom-scale"
          min={MIN_IMAGE_MULTIPLIER}
          max={MAX_IMAGE_MULTIPLIER}
          step={0.25}
          value={[scale]}
          disabled={!allowCustomScale}
          onValueChange={handleChangeScale}
        />
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
