import React from 'react'
import { FormattedMessage } from 'react-intl'

import alertIcon from 'url:~/images/warning_alert.svg'
import errorIcon from 'url:~/images/warning_error.svg'
import {
  SLICE_WARNING_OUTSIDE,
  SLICE_WARNING_WIDTH_TOO_SMALL,
  SLICE_WARNING_WIDTH_TOO_LARGE,
  SLICE_WARNING_DANGEROUS_EXISTING,
  SLICE_WARNING_SLOPE_EXCEEDED
} from '~/src/segments/constants'
import './Warnings.css'

import type { Segment } from '@streetmix/types'

interface WarningsProps {
  segment?: Pick<Segment, 'warnings'>
}

export function Warnings (props: WarningsProps): React.ReactElement | null {
  const { segment } = props
  const messages = []

  if (segment === undefined) return null

  if (segment.warnings[SLICE_WARNING_DANGEROUS_EXISTING]) {
    messages.push({
      type: 'alert',
      message: (
        <FormattedMessage
          id="segments.warnings.dangerous"
          defaultMessage="This is a dangerous existing condition."
        />
      )
    })
  }
  if (segment.warnings[SLICE_WARNING_OUTSIDE]) {
    messages.push({
      type: 'error',
      message: (
        <FormattedMessage
          id="segments.warnings.does-not-fit"
          defaultMessage="This doesn’t fit within the street."
        />
      )
    })
  }
  if (segment.warnings[SLICE_WARNING_WIDTH_TOO_SMALL]) {
    messages.push({
      type: 'error',
      message: (
        <FormattedMessage
          id="segments.warnings.not-wide"
          defaultMessage="This may not be wide enough."
        />
      )
    })
  }
  if (segment.warnings[SLICE_WARNING_WIDTH_TOO_LARGE]) {
    messages.push({
      type: 'error',
      message: (
        <FormattedMessage
          id="segments.warnings.too-wide"
          defaultMessage="This may be too wide."
        />
      )
    })
  }
  if (segment.warnings[SLICE_WARNING_SLOPE_EXCEEDED]) {
    messages.push({
      type: 'error',
      message: (
        <FormattedMessage
          id="segments.warnings.slope-too-high"
          defaultMessage="This may be too steep."
        />
      )
    })
  }

  if (messages.length > 0) {
    return (
      <div className="popup-warnings">
        <ul>
          {messages.map((item) => {
            let icon
            switch (item.type) {
              case 'alert':
                icon = <img src={alertIcon} alt="" />
                break
              case 'error':
              default:
                icon = <img src={errorIcon} alt="" />
                break
            }

            return (
              <li
                key={item.message.props.id}
                className={`popup-warning-${item.type}`}
              >
                {icon} {item.message}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  return null
}
