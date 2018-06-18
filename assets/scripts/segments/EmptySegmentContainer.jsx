import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import EmptySegment from './EmptySegment'

/**
 * This is a "container" component in the React presentational/container component pattern.
 * This component determines how many <EmptySegment /> components are rendered, how
 * wide they are, and where they are positioned.
 *
 * TODO: this component should also handle the dragging state, and render zero <EmptySegment />
 * components when this is happening.
 */
export class EmptySegmentContainer extends React.Component {
  static propTypes = {
    remainingWidth: PropTypes.number,
    occupiedWidth: PropTypes.number
  }

  render () {
    const { remainingWidth, occupiedWidth } = this.props

    // If there is no remaining width, display nothing
    if (remainingWidth <= 0) {
      return null
    }

    // If street is not occupied by any segments, then only display one empty segment
    // at the full width of the street (which equals `remainingWidth`)
    if (!occupiedWidth) {
      return <EmptySegment width={remainingWidth} />
    }

    // If the street has segments, then we display 2 segments of equal width at the
    // left and right side of the street by splitting the remaining width in half.
    const width = remainingWidth / 2

    return (
      <React.Fragment>
        <EmptySegment width={width} left={0} />
        <EmptySegment width={width} left={width + occupiedWidth} />
      </React.Fragment>
    )
  }
}

function mapStateToProps (state) {
  return {
    remainingWidth: state.street.remainingWidth,
    occupiedWidth: state.street.occupiedWidth
  }
}

export default connect(mapStateToProps)(EmptySegmentContainer)
