import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import MeasurementText from '../ui/MeasurementText'
import { TILE_SIZE } from '../segments/view'
import { t } from '../app/locale'

class EmptySegment extends React.PureComponent {
  static propTypes = {
    remainingWidth: PropTypes.number,
    occupiedWidth: PropTypes.number,
    units: PropTypes.number,
    position: PropTypes.string
  }

  getSegmentInfo (remainingWidth, occupiedWidth, position) {
    const segmentInfo = {
      className: 'segment empty',
      segmentWidth: 0,
      widthValue: 0
    }

    if (remainingWidth > 0) {
      const width = (occupiedWidth) ? remainingWidth / 2 : remainingWidth
      if (!occupiedWidth && position === 'right') {
        return segmentInfo
      } else {
        segmentInfo.segmentWidth = (position === 'right') ? width * TILE_SIZE - 1 : width * TILE_SIZE
        segmentInfo.widthValue = width
        segmentInfo.className += ' visible'
      }
    }

    return segmentInfo
  }

  render () {
    const { remainingWidth, occupiedWidth, position, units } = this.props
    const segmentInfo = this.getSegmentInfo(remainingWidth, occupiedWidth, position)

    const style = {
      width: segmentInfo.segmentWidth + 'px',
      right: (position === 'right') ? '1px' : 'auto'
    }

    return (
      <div className={segmentInfo.className} style={style}>
        <span className="name">{t('section.empty', 'Empty space')}</span>
        <span className="width">
          <MeasurementText value={segmentInfo.widthValue} units={units} />
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
