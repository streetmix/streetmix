import React from 'react'

import './StreetViewDirt.css'

interface StreetViewDirtProps {
  boundaryWidth: number
}

const StreetViewDirt = ({
  boundaryWidth
}: StreetViewDirtProps): React.ReactElement => {
  const dirtStyle = {
    marginLeft: `-${boundaryWidth}px`,
    marginRight: `-${boundaryWidth}px`
  }
  const width = `${boundaryWidth}px`

  return (
    <section className="street-section-dirt" style={dirtStyle}>
      <div className="street-section-dirt-left" style={{ width }} />
      <div className="street-section-dirt-right" style={{ width }} />
    </section>
  )
}

export default StreetViewDirt
