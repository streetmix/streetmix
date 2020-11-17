import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useSelector, useDispatch } from 'react-redux'
import { DEFAULT_CAPACITY_SOURCE } from '../../streets/constants'
import { isOwnedByCurrentUser } from '../../streets/owner'
import { getAllCapacityDataSources } from '../../segments/capacity'
import { setCapacitySource } from '../../store/actions/street'

function CapacitySources (props) {
  const source = useSelector(
    (state) => state.street?.capacitySource || DEFAULT_CAPACITY_SOURCE
  )
  const dispatch = useDispatch()

  const [selectedSource, setSelectedSource] = useState(source)

  function handleChangeSource (event) {
    setSelectedSource(event.target.value)
    dispatch(setCapacitySource(event.target.value))
  }

  // Retrieve all data sources, and make it an array
  const sources = Object.values(getAllCapacityDataSources())

  return (
    <p>
      <strong>
        <FormattedMessage
          id="dialogs.analytics.capacity-data-source"
          defaultMessage="Capacity data source"
        />
        :&lrm;
      </strong>{' '}
      <select
        disabled={!isOwnedByCurrentUser()}
        value={selectedSource}
        onChange={handleChangeSource}
      >
        {sources.map(({ source_author: label, id }) => {
          return (
            <option key={id} value={id}>
              {label}
            </option>
          )
        })}
      </select>
    </p>
  )
}

export default CapacitySources
