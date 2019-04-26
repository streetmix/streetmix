/* eslint-env jest */
import { withProps } from 'recompose'

export function DropTarget (type, spec, collect, options) {
  return function decorateTarget (DecoratedComponent) {
    return withProps({
      connectDragSource: (d) => d,
      connectDropTarget: (d) => d,
      connectDragPreview: (d) => d
    })(DecoratedComponent)
  }
}
export function DragSource (type, spec, collect, options) {
  return function decorateSource (DecoratedComponent) {
    return withProps({
      connectDragSource: (d) => d,
      connectDropTarget: (d) => d,
      connectDragPreview: (d) => d
    })(DecoratedComponent)
  }
}
