import React from 'react'
import { DragPreviewImage, type ConnectDragPreview } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'

interface EmptyDragPreviewProps {
  dragPreview: ConnectDragPreview
}

// Empty image "cache"
const image = getEmptyImage()

function EmptyDragPreview ({
  dragPreview
}: EmptyDragPreviewProps): React.ReactNode {
  return <DragPreviewImage connect={dragPreview} src={image.src} />
}

export default EmptyDragPreview
