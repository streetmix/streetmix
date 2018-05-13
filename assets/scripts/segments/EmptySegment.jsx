import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import MeasurementText from '../ui/MeasurementText'
import { TILE_SIZE } from '../segments/constants'
import { t } from '../app/locale'

export class EmptySegment extends React.PureComponent {
  static propTypes = {
    remainingWidth: PropTypes.number,
    occupiedWidth: PropTypes.number,
    units: PropTypes.number,
    position: PropTypes.string
  }

  getActualWidth (occupiedWidth, remainingWidth, position) {
    // If street is empty, only display the left side empty segment, make right side 0 width
    if (!occupiedWidth && position === 'right') return 0
    return (occupiedWidth) ? remainingWidth / 2 : remainingWidth
  }

  getSegmentRenderWidth (width, position) {
    return (position === 'right') ? width * TILE_SIZE - 1 : width * TILE_SIZE
  }

  render () {
    const { remainingWidth, occupiedWidth, position, units } = this.props

    const width = this.getActualWidth(occupiedWidth, remainingWidth, position)
    const renderWidth = this.getSegmentRenderWidth(width, position)

    const classNames = ['segment', 'segment-empty']
    if (width > 0) classNames.push('visible')

    const style = {
      width: renderWidth + 'px',
      // Adjust right empty segment by 1px for visual placement
      right: (position === 'right') ? '1px' : 'auto'
    }

    return (
      <div className={classNames.join(' ')} style={style}>
        <span className="name">{t('section.empty', 'Empty space')}</span>
        <span className="width">
          <MeasurementText value={width} units={units} />
        </span>
        <span className="grid" />
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    remainingWidth: state.street.remainingWidth,
    occupiedWidth: state.street.occupiedWidth,
    units: state.street.units,
    locale: state.locale.locale
  }
}

export default connect(mapStateToProps)(EmptySegment)
