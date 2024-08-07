import React, { useRef } from 'react'
import { useIntl } from 'react-intl'
import DownshiftPelias from 'downshift-pelias' // TODO: type definitions
import Pelias from 'pelias-js' // TODO: type definitions

import { PELIAS_HOST_NAME, PELIAS_API_KEY } from '../../app/config'

import type { LatLngObject } from '@streetmix/types'
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Point,
  Position
} from 'geojson'

interface GeoSearchProps {
  handleSearchResults: (geo: Position, properties: GeoJsonProperties) => void
  focus: LatLngObject
}

type DownshiftPeliasGetter = (opts: unknown) => Record<string, unknown>
interface DownshiftPeliasProps {
  getInputProps: DownshiftPeliasGetter
  getMenuProps: DownshiftPeliasGetter
  getItemProps: DownshiftPeliasGetter
  clearSelection: () => void
  inputValue: string
  isOpen: boolean
  results: FeatureCollection
}

function GeoSearch ({
  handleSearchResults,
  focus = { lat: 0, lng: 0 }
}: GeoSearchProps): React.ReactElement {
  const intl = useIntl()
  const inputEl = useRef<HTMLInputElement>()

  function handleClickClearSearch (clearSelection: () => void): void {
    clearSelection()
    inputEl.current?.focus()
  }

  function handleChange (selection?: Feature): void {
    if (!selection) return

    handleSearchResults(
      (selection.geometry as Point).coordinates.reverse(),
      selection.properties
    )
    inputEl.current?.focus()
  }

  function renderSuggestion (
    item: Feature,
    index: number,
    inputValue: string,
    getItemProps: DownshiftPeliasGetter
  ): React.ReactElement {
    const label = item.properties?.label

    // Highlight the input query
    const regex = new RegExp(`(${inputValue})`, 'gi')
    const parts = label.split(regex)
    const highlighted = parts.map((part: string, index: number) => {
      if (part.toLowerCase() === inputValue.toLowerCase()) {
        return <strong key={index}>{part}</strong>
      }
      return part
    })

    return (
      <li
        {...getItemProps({
          className: 'geotag-suggestion',
          key: item.properties?.gid,
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
      }: DownshiftPeliasProps) => (
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
          {isOpen && results?.features.length > 0 && (
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
