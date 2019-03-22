import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import './PaletteTrashcan.scss'

export const PaletteTrashcan = (props) => {
  const { visible } = props
  const classNames = ['palette-trashcan']

  if (visible) {
    classNames.push('palette-trashcan-visible')
  }

  return (
    <div className={classNames.join(' ')}>
      <FormattedMessage id="palette.remove" defaultMessage="Drag here to remove" />
    </div>
  )
}

PaletteTrashcan.propTypes = {
  visible: PropTypes.bool
}

PaletteTrashcan.defaultProps = {
  visible: false
}

function mapStateToProps (state) {
  // Display the trashcan when user is dragging an _existing_ segment on the street.
  // Don't display the trashcan when the user is dragging a _new_ segment from the palette.
  // `draggedSegment` is `null` when no drag action is being performed.
  // `draggedSegment` is `undefined` when the user is dragging a _new_ segment.
  // Don't use a falsy check, as `draggedSegment` is `0` for the first segment.
  return {
    visible: state.ui.draggingState && Number.isInteger(state.ui.draggingState.draggedSegment)
  }
}

export default connect(mapStateToProps)(PaletteTrashcan)
