import React from 'react'
import { FormattedMessage } from 'react-intl'
import { useSelector } from '../store/hooks'
import { TILE_SIZE } from './constants'
import SegmentLabelContainer from './SegmentLabelContainer'
import './EmptySegment.scss'

interface EmptySegmentProps {
  width: number
  left: number
}

function EmptySegment ({
  width,
  left
}: EmptySegmentProps): React.ReactElement | null {
  const units = useSelector((state) => state.street.units)
  const locale = useSelector((state) => state.locale.locale)

  // Do not render if width is a negative number
  if (width <= 0) return null

  // Inline style specifies size and position
  // `width` and `left` are provided as real-world measurements. This is
  // multiplied by TILE_SIZE to get the pixel dimension and offset.
  const style = {
    width: width * TILE_SIZE + 'px',
    left: left * TILE_SIZE + 'px'
  }

  return (
    <div className="segment segment-empty" style={style}>
      <SegmentLabelContainer
        label={
          <FormattedMessage id="section.empty" defaultMessage="Empty space" />
        }
        width={width}
        units={units}
        locale={locale}
      />
    </div>
  )
}

export default EmptySegment
