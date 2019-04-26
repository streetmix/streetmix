/* eslint-env jest */
import { withProps } from 'recompose'

export const DropTarget = (type, spec, collect, options) => {
  return (DecoratedComponent) => {
    return withProps({
      connectDropTarget: (d) => d
    })(DecoratedComponent)
  }
}
export const DragSource = (type, spec, collect, options) => {
  return (DecoratedComponent) => {
    return withProps({
      connectDragSource: (d) => d,
      connectDragPreview: (d) => d
    })(DecoratedComponent)
  }
}
