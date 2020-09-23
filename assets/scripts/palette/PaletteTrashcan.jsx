import React from 'react'
import { useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import './PaletteTrashcan.scss'

function PaletteTrashcan (props) {
  // Display the trashcan when user is dragging an _existing_ segment on the street.
  // Don't display the trashcan when the user is dragging a _new_ segment from the palette.
  // `draggedSegment` is `null` when no drag action is being performed.
  // `draggedSegment` is `undefined` when the user is dragging a _new_ segment.
  // Don't use a falsy check, as `draggedSegment` is `0` for the first segment.
  const visible = useSelector(
    (state) =>
      state.ui.draggingState &&
      Number.isInteger(state.ui.draggingState.draggedSegment)
  )

  return (
    <div className="palette-trashcan" hidden={!visible}>
      <FormattedMessage
        id="palette.remove"
        defaultMessage="Drag here to remove"
      />
    </div>
  )
}

export default PaletteTrashcan
