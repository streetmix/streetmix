import { getSegmentInfo, SliceTypes } from '@streetmix/parts'
import { FormattedMessage } from 'react-intl'

// TODO: use <Icon />
import alertIcon from 'url:~/images/warning_alert.svg'
import errorIcon from 'url:~/images/warning_error.svg'
import { useSelector } from '~/src/store/hooks.js'
import './Warnings.css'

import type { SliceItem } from '@streetmix/types'

interface WarningsProps {
  slice?: Pick<SliceItem, 'id' | 'type'>
}

export function Warnings({ slice }: WarningsProps) {
  const sliceWarnings = useSelector((state) => state.warnings.slices)
  const messages = []

  if (slice === undefined) return null

  const warnings = sliceWarnings[slice.id] ?? {}

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

  const sliceType = getSegmentInfo(slice.type).owner
  if (warnings.slopeBermExceeded && sliceType === SliceTypes.NATURE) {
    messages.push({
      type: 'error',
      message: (
        <FormattedMessage
          id="segments.warnings.slope-exceeded-berm"
          defaultMessage="This may be too steep for vegetation."
        />
      ),
    })
  } else if (
    warnings.slopePathExceeded &&
    sliceType === SliceTypes.PEDESTRIAN
  ) {
    messages.push({
      type: 'error',
      message: (
        <FormattedMessage
          id="segments.warnings.slope-exceeded-path"
          defaultMessage="This may be too steep for people."
        />
      ),
    })
  } else if (warnings.slopeBermExceeded || warnings.slopePathExceeded) {
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
