import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { startPrinting, stopPrinting } from '../store/slices/app'
import { getStreetImage } from '../streets/image'
import './PrintContainer.scss'

function PrintContainer (props) {
  const isPrinting = useSelector((state) => state.app.printing)
  const street = useSelector((state) => state.street)
  const dispatch = useDispatch()

  useEffect(() => {
    function mediaQueryChangeHandler (mql) {
      if (mql.matches) {
        dispatch(startPrinting())
      } else {
        dispatch(stopPrinting())
      }
    }

    const beforeprintHandler = () => dispatch(startPrinting())
    const afterprintHandler = () => dispatch(stopPrinting())

    // Add event listeners to handle a print event
    window.addEventListener('beforeprint', beforeprintHandler)
    window.addEventListener('afterprint', afterprintHandler)

    // Some older browsers (Chrome < 63, current Safari) do not
    // have the 'beforeprint' or 'afterprint' events
    // We listen for media query changes in another way
    const mediaQueryList = window.matchMedia('print')
    mediaQueryList.addListener(mediaQueryChangeHandler)

    // Clean up listeners
    return () => {
      window.removeEventListener('beforeprint', beforeprintHandler)
      window.removeEventListener('afterprint', afterprintHandler)
      mediaQueryList.removeListener(mediaQueryChangeHandler)
    }
  }, [dispatch])

  function createPrintImage () {
    if (isPrinting) {
      const dataUrl = getStreetImage(street, true, true, false).toDataURL(
        'image/png'
      )
      return <img src={dataUrl} />
    }

    return null
  }

  return <div className="print-container">{createPrintImage()}</div>
}

export default PrintContainer
