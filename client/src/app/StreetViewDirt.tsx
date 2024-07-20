import React, { useRef, useEffect } from 'react'

import { getStreetSectionTop } from './window_resize'
import './StreetViewDirt.scss'

interface StreetViewDirtProps {
  buildingWidth: number
}

const StreetViewDirt = ({
  buildingWidth
}: StreetViewDirtProps): React.ReactElement => {
  const dirtStyle = {
    marginLeft: -buildingWidth + 'px',
    marginRight: -buildingWidth + 'px',
    height: getDirtElementHeight() + 'px'
  }
  const width = `${buildingWidth}px`

  // On window resize, figure out what height it should be and apply it
  const dirtEl = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleResize (): void {
      if (dirtEl.current !== null) {
        dirtEl.current.style.height = getDirtElementHeight() + 'px'
      }
    }

    // Set window listener to do this
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <section className="street-section-dirt" ref={dirtEl} style={dirtStyle}>
      <div className="street-section-dirt-left" style={{ width }} />
      <div className="street-section-dirt-right" style={{ width }} />
    </section>
  )
}

function getDirtElementHeight (): number {
  const streetSectionTop = getStreetSectionTop()
  return window.innerHeight - streetSectionTop - 400 + 180
}

export default StreetViewDirt
