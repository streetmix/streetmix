import { FormattedMessage } from 'react-intl'

import { useSelector } from '../store/hooks.js'
import './PaletteTrashcan.css'

export function PaletteTrashcan() {
  // Display the trashcan when user is dragging an _existing_ segment on the street.
  // Don't display the trashcan when the user is dragging a _new_ segment from the palette.
  // `draggedSegment` is `null` when no drag action is being performed.
  // `draggedSegment` is `undefined` when the user is dragging a _new_ segment.
  // Don't use a falsy check, as `draggedSegment` is `0` for the first segment.
  const visible = useSelector(
    (state): boolean =>
      (state.ui.draggingState &&
        Number.isInteger(state.ui.draggingState.draggedSegment)) ??
      false
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
