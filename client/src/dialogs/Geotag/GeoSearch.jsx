import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import DownshiftPelias from 'downshift-pelias'
import Pelias from 'pelias-js'
import { PELIAS_HOST_NAME, PELIAS_API_KEY } from '../../app/config'

GeoSearch.propTypes = {
  handleSearchResults: PropTypes.func,
  focus: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  })
}

function GeoSearch ({ handleSearchResults, focus = { lat: 0, lng: 0 } }) {
  const intl = useIntl()
  const inputEl = useRef()

  function handleClickClearSearch (clearSelection) {
    clearSelection()
    inputEl.current.focus()
  }

  function handleChange (selection) {
    if (!selection) return

    handleSearchResults(
      selection.geometry.coordinates.reverse(),
      selection.properties
    )
    inputEl.current.focus()
  }

  function renderSuggestion (item, index, inputValue, getItemProps) {
    const label = item.properties.label

    // Highlight the input query
    const regex = new RegExp(`(${inputValue})`, 'gi')
    const parts = label.split(regex)
    const highlighted = parts.map((part, index) => {
      if (part.toLowerCase() === inputValue.toLowerCase()) {
        return <strong key={index}>{part}</strong>
      }
      return part
    })

    return (
      <li
        {...getItemProps({
          className: 'geotag-suggestion',
          key: item.properties.gid,
          index,
          item
        })}
      >
        {highlighted}
      </li>
    )
  }

  const pelias = new Pelias({
    peliasUrl: `https://${PELIAS_HOST_NAME}`,
    apiKey: PELIAS_API_KEY
  })

  pelias.search.setBoundaryCircle({
    lat: focus.lat,
    lon: focus.lng,
    radius: 10
  })
  pelias.autocomplete.setFocusPoint({ lat: focus.lat, lon: focus.lng })

  return (
    <DownshiftPelias pelias={pelias} onChange={handleChange}>
      {({
        getInputProps,
        getMenuProps,
        getItemProps,
        clearSelection,
        inputValue,
        isOpen,
        results
      }) => (
        <div className="geotag-input-form">
          <input
            {...getInputProps({
              className: 'geotag-input',
              autoFocus: true,
              ref: inputEl,
              placeholder: intl.formatMessage({
                id: 'dialogs.geotag.search',
                defaultMessage: 'Search for a location'
              })
            })}
          />
          {inputValue && (
            <span
              title={intl.formatMessage({
                id: 'dialogs.geotag.clear-search',
                defaultMessage: 'Clear search'
              })}
              className="geotag-input-clear"
              onClick={() => {
                handleClickClearSearch(clearSelection)
              }}
            >
              ×
            </span>
          )}
          {isOpen && results && results.features.length > 0 && (
            <div className="geotag-suggestions-container">
              <ul {...getMenuProps({ className: 'geotag-suggestions-list' })}>
                {results.features.map((item, index) =>
                  renderSuggestion(item, index, inputValue, getItemProps)
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </DownshiftPelias>
  )
}

export default GeoSearch
