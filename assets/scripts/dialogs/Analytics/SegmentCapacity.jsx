import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { getLocaleSegmentName } from '../../segments/view'
import CapacityMessage from './CapacityMessage'

SegmentCapacity.propTypes = {
  index: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  chartMax: PropTypes.number.isRequired,
  customCapacity: PropTypes.object,
  capacity: PropTypes.shape({
    average: PropTypes.number,
    potential: PropTypes.number
  }).isRequired,
  updateCapacity: PropTypes.func.isRequired,
  segment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    variantString: PropTypes.string.isRequired
  }).isRequired
}

function SegmentCapacity ({
  type,
  capacity,
  customCapacity = {},
  segment,
  index,
  chartMax,
  updateCapacity
}) {
  const locale = useSelector((state) => state.locale.locale)
  let { average, potential } = capacity

  if (Number.isInteger(customCapacity.average)) {
    average = customCapacity.average
  }
  if (Number.isInteger(customCapacity.potential)) {
    potential = customCapacity.potential
  }

  const [newPotential, setNewPotential] = useState(potential)
  const [newAverage, setNewAverage] = useState(average)

  const handleChangePotential = (e) => {
    e.preventDefault()
    setNewPotential(e.target.value)
  }

  const handleChangeAverage = (e) => {
    e.preventDefault()
    setNewAverage(e.target.value)
  }

  const [isEditing, setEditing] = useState(false)
  const toggleEditing = () => setEditing(!isEditing)

  const saveValue = (e) => {
    e.preventDefault()
    updateCapacity({
      average: Number.parseInt(newAverage, 10),
      potential: Number.parseInt(newPotential, 10)
    })
    toggleEditing()
  }
  const label = getLocaleSegmentName(type, locale)

  return (
    <div className="segment-analytics">
      {label}&nbsp;
      {!isEditing && (
        <CapacityMessage
          average={newAverage}
          potential={newPotential}
          locale={locale}
        />
      )}
      {isEditing && (
        <input
          type="number"
          value={newAverage}
          onChange={handleChangeAverage}
        />
      )}
      {isEditing && (
        <input
          type="number"
          value={newPotential}
          onChange={handleChangePotential}
        />
      )}
      {isEditing && <button onClick={saveValue}>save</button>}
      {!isEditing && <button onClick={toggleEditing}>edit</button>}
    </div>
  )
}

export default SegmentCapacity
