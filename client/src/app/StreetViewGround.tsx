import React from 'react'

import './StreetViewGround.css'

interface StreetViewGroundProps {
  boundaryWidth: number
}

const StreetViewGround = ({
  boundaryWidth
}: StreetViewGroundProps): React.ReactElement => {
  const dirtStyle = {
    marginLeft: `-${boundaryWidth}px`,
    marginRight: `-${boundaryWidth}px`
  }

  return <section className="street-section-ground" style={dirtStyle} />
}

export default StreetViewGround
