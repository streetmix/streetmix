import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { startPrinting, stopPrinting } from '../store/actions/app'
import { getStreetImage } from '../streets/image'
import './PrintContainer.scss'

const PrintContainer = (props) => {
  const { isPrinting = false, startPrinting, stopPrinting, street } = props

  useEffect(() => {
    function mediaQueryChangeHandler (mql) {
      if (mql.matches) {
        startPrinting()
      } else {
        stopPrinting()
      }
    }

    // Add event listeners to handle a print event
    window.addEventListener('beforeprint', startPrinting)
    window.addEventListener('afterprint', stopPrinting)

    // Some older browsers (Chrome < 63, current Safari) do not
    // have the 'beforeprint' or 'afterprint' events
    // We listen for media query changes in another way
    const mediaQueryList = window.matchMedia('print')
    mediaQueryList.addListener(mediaQueryChangeHandler)

    // Clean up listeners
    return function cleanup () {
      window.removeEventListener('beforeprint', startPrinting)
      window.removeEventListener('afterprint', stopPrinting)
      mediaQueryList.removeListener(mediaQueryChangeHandler)
    }
  }, [startPrinting, stopPrinting])

  function createPrintImage () {
    if (isPrinting) {
      const dataUrl = getStreetImage(street, true, true, false).toDataURL('image/png')
      return <img src={dataUrl} />
    }

    return null
  }

  return (
    <div className="print-container">
      {createPrintImage()}
    </div>
  )
}

PrintContainer.propTypes = {
  isPrinting: PropTypes.bool,
  street: PropTypes.object.isRequired,
  startPrinting: PropTypes.func.isRequired,
  stopPrinting: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  isPrinting: state.app.printing,
  street: state.street
})

const mapDispatchToProps = {
  startPrinting,
  stopPrinting
}

export default connect(mapStateToProps, mapDispatchToProps)(PrintContainer)
