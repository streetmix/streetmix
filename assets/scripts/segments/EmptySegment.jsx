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
    position: PropTypes.string,
    locale: PropTypes.string
  }

  getActualWidth (occupiedWidth, remainingWidth, position) {
    // If street is empty, only display the left side empty segment, make right side 0 width
    if (!occupiedWidth && position === 'right') return 0
    return (occupiedWidth) ? remainingWidth / 2 : remainingWidth
  }

  render () {
    const { remainingWidth, occupiedWidth, position, units, locale } = this.props
    const width = this.getActualWidth(occupiedWidth, remainingWidth, position)
    const style = {
      width: (width * TILE_SIZE) + 'px',
      display: (width <= 0) ? 'none' : undefined,
      right: (position === 'right') ? 0 : 'auto'
    }

    return (
      <div className="segment segment-empty" style={style}>
        <span className="name">{t('section.empty', 'Empty space')}</span>
        <span className="width">
          <MeasurementText value={width} units={units} locale={locale} />
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
