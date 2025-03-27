import React from 'react'
import { type ConnectDragPreview } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'

/*
Helper component to hide source drag previews for react-dnd. Their docs are
super out of date, so I don't know if this is the "best" way to do it.
All you need to do is pass it the `dragPreview` returned from `useDrag`,
then make sure this component is rendered in the tree.
*/

interface EmptyDragPreviewProps {
  dragPreview: ConnectDragPreview
}

function EmptyDragPreview ({
  dragPreview
}: EmptyDragPreviewProps): React.ReactNode {
  const image = getEmptyImage()
  return (
    <img
      ref={dragPreview}
      src={image.src}
      alt=""
      style={{
        display: 'none'
      }}
    />
  )
}

export default EmptyDragPreview
