import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import EmptySegment from './EmptySegment'

/**
 * This is a "container" component in the React presentational/container
 * component pattern. This component determines how many child <EmptySegment />
 * components are rendered, how wide they are, and where they are positioned.
 *
 * TODO: this component should also be aware of the dragging state, and render
 * zero <EmptySegment /> components when this is happening.
 */
export class EmptySegmentContainer extends React.Component {
  static propTypes = {
    remainingWidth: PropTypes.number,
    occupiedWidth: PropTypes.number
  }

  render () {
    const { remainingWidth, occupiedWidth } = this.props
    const emptySegments = []

    // If there is no remaining width, display nothing
    if (remainingWidth > 0) {
      // If street is not occupied by any segments, then only display one empty segment
      // at the full width of the street (which equals `remainingWidth`)
      if (!occupiedWidth) {
        emptySegments.push({ width: remainingWidth })
      } else {
        // If the street has segments, then we display 2 segments of equal width at the
        // left and right side of the street by splitting the remaining width in half.
        const width = remainingWidth / 2

        emptySegments.push(
          { width, left: 0 },
          { width, left: width + occupiedWidth }
        )
      }
    }

    // Returning a Fragment is not strictly required by React, but without it, Enzyme
    // (tests) fail
    return (
      <React.Fragment>
        {emptySegments.map(({ width, left }, i) => <EmptySegment key={i} width={width} left={left} />)}
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
