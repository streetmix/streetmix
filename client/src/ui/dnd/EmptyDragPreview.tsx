import { DragPreviewImage, type ConnectDragPreview } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'

interface EmptyDragPreviewProps {
  dragPreview: ConnectDragPreview
}

// Empty image "cache"
const image = getEmptyImage()

export function EmptyDragPreview({ dragPreview }: EmptyDragPreviewProps) {
  return <DragPreviewImage connect={dragPreview} src={image.src} />
}
