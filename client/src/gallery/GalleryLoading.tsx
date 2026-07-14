import './GalleryLoading.css'

export function GalleryLoading() {
  return (
    <div className="gallery-loading" aria-live="polite" aria-busy="true">
      <div className="gallery-loading-placeholders">
        <div className="gallery-loading-item" />
        <div className="gallery-loading-item" />
        <div className="gallery-loading-item" />
        <div className="gallery-loading-item" />
        <div className="gallery-loading-item" />
        <div className="gallery-loading-item" />
        <div className="gallery-loading-item" />
        <div className="gallery-loading-item" />
      </div>
    </div>
  )
}
