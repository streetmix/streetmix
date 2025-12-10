import { useSelector } from '../store/hooks.js'
import { useGetUserQuery } from '../store/services/api.js'
import { GalleryError } from './GalleryError.js'
import { GalleryLoading } from './GalleryLoading.js'
import { GalleryContents } from './GalleryContents.js'

// This component only handles switching between display modes
export function GalleryPanel() {
  // Mode is set in state after streets have loaded
  // We use RTK Query to load user data in this component
  // There might be a better way of combining these requests!
  const { mode, userId } = useSelector((state) => state.gallery)
  const { data, isError, isLoading } = useGetUserQuery(userId)

  let childElements

  if (mode === 'loading' || isLoading) {
    childElements = <GalleryLoading />
  } else if (mode === 'error' || isError) {
    childElements = <GalleryError />
  } else if (mode === 'gallery') {
    // It is not necessary to have a user property to load the gallery
    childElements = <GalleryContents user={data} />
  } else {
    childElements = null
  }

  return <div className="gallery-panel">{childElements}</div>
}
