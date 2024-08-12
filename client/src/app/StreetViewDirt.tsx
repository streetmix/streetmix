import React from 'react'

import './StreetViewDirt.css'

interface StreetViewDirtProps {
  buildingWidth: number
}

const StreetViewDirt = ({
  buildingWidth
}: StreetViewDirtProps): React.ReactElement => {
  const dirtStyle = {
    marginLeft: `-${buildingWidth}px`,
    marginRight: `-${buildingWidth}px`
  }
  const width = `${buildingWidth}px`

  return (
    <section className="street-section-dirt" style={dirtStyle}>
      <div className="street-section-dirt-left" style={{ width }} />
      <div className="street-section-dirt-right" style={{ width }} />
    </section>
  )
}

export default StreetViewDirt
