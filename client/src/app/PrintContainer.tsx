import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

import { useSelector, useDispatch } from '../store/hooks.js'
import { startPrinting, stopPrinting } from '../store/slices/app.js'
import { getStreetImage } from '../streets/image.js'
import './PrintContainer.css'

export function PrintContainer() {
  const isPrinting = useSelector((state) => state.app.printing)
  const street = useSelector((state) => state.street)
  const dispatch = useDispatch()
  const [printImage, setPrintImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Set up and tear down event listeners
  useEffect(() => {
    const beforeprintHandler = (): void => {
      // `flushSync` is a rarely used React feature that forces updates to
      // synchronously "flush" to DOM in order to play nicely with the
      // browser. We *need* to do this during the `beforeprint` event
      // otherwise there's nothing to print!
      // https://beta.reactjs.org/reference/react-dom/flushSync
      flushSync(() => {
        dispatch(startPrinting())
      })
    }
    const afterprintHandler = (): void => {
      dispatch(stopPrinting())
    }

    // Add event listeners to handle a print event
    window.addEventListener('beforeprint', beforeprintHandler)
    window.addEventListener('afterprint', afterprintHandler)

    // Clean up listeners
    return () => {
      window.removeEventListener('beforeprint', beforeprintHandler)
      window.removeEventListener('afterprint', afterprintHandler)
    }
  }, [dispatch])

  // Generates an image for printing
  useEffect(() => {
    let cancelled = false

    async function generateImage() {
      try {
        setError(null)
        const image = await getStreetImage(street, true, true, false)
        if (!cancelled) {
          setPrintImage(image.toDataURL('image/png'))
        }
      } catch (e) {
        if (!cancelled) setError(`Could not load image. ${e}`)
      }
    }

    // Only call this when isPrinting is set (otherwise it just renders in
    // background expensively)
    if (isPrinting) {
      generateImage()
    }

    // Handles when this component becomes unmounted before promises resolve
    return () => {
      cancelled = true
    }
  }, [isPrinting, street])

  return (
    <div className="print-container">
      {error && <p>{error}</p>}
      {!error && !printImage && <p>Preparing print...</p>}
      {!error && printImage !== null && <img src={printImage} />}
    </div>
  )
}
