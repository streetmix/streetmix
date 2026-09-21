import { FormattedMessage } from 'react-intl'

// TODO: use <Icon />
import alertIcon from 'url:~/images/warning_alert.svg'
import errorIcon from 'url:~/images/warning_error.svg'
import './Warnings.css'

import type { Segment } from '@streetmix/types'

interface WarningsProps {
  segment?: Pick<Segment, 'warnings'>
}

export function Warnings(props: WarningsProps) {
  const { segment } = props
  const messages = []

  if (segment === undefined) return null
  const warnings = segment.warnings ?? [false]

  if (warnings.dangerousExisting) {
    messages.push({
      type: 'alert',
      message: (
        <FormattedMessage
          id="segments.warnings.dangerous"
          defaultMessage="This is a dangerous existing condition."
        />
      ),
    })
  }
  if (warnings.outOfBounds) {
    messages.push({
      type: 'error',
      message: (
        <FormattedMessage
          id="segments.warnings.does-not-fit"
          defaultMessage="This doesn’t fit within the street."
        />
      ),
    })
  }
  if (warnings.tooNarrow) {
    messages.push({
      type: 'error',
      message: (
        <FormattedMessage
          id="segments.warnings.not-wide"
          defaultMessage="This may not be wide enough."
        />
      ),
    })
  }
  if (warnings.tooWide) {
    messages.push({
      type: 'error',
      message: (
        <FormattedMessage
          id="segments.warnings.too-wide"
          defaultMessage="This may be too wide."
        />
      ),
    })
  }
  if (warnings.slopeBermExceeded || warnings.slopePathExceeded) {
    messages.push({
      type: 'error',
      message: (
        <FormattedMessage
          id="segments.warnings.slope-exceeded"
          defaultMessage="This may be too steep."
        />
      ),
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
