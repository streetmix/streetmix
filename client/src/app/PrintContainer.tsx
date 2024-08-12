import React, { useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'

import { useSelector, useDispatch } from '../store/hooks'
import { startPrinting, stopPrinting } from '../store/slices/app'
import { getStreetImage } from '../streets/image'
import './PrintContainer.css'

function PrintContainer (): React.ReactElement {
  const isPrinting = useSelector((state) => state.app.printing)
  const street = useSelector((state) => state.street)
  const dispatch = useDispatch()
  const printImage = useRef<string | null>(null)

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

  if (isPrinting) {
    // Caches the image to a ref. This DOM element is only visible in a print
    // media query, but leaving it around after printing is over allows
    // debugging the print result after the print action is done.
    printImage.current = getStreetImage(street, true, true, false).toDataURL(
      'image/png'
    )
  }

  return (
    <div className="print-container">
      {printImage.current !== null && <img src={printImage.current} />}
    </div>
  )
}

export default PrintContainer
