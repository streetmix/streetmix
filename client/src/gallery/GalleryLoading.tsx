import LoadingSpinner from '../ui/LoadingSpinner.js'

export function GalleryLoading() {
  return (
    <div className="gallery-loading" aria-live="polite" aria-busy="true">
      <LoadingSpinner />
    </div>
  )
}
