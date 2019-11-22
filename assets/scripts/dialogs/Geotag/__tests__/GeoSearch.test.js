/* eslint-env jest */
import React from 'react'
import { fireEvent } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../../test/helpers/render'
import GeoSearch from '../GeoSearch'
import autocompleteResponse from './fixtures/autocomplete.json'
import searchResponse from './fixtures/search.json'

// Mocks an Mapzen Search request
const mapzenSearchMock = jest.fn((url) => {
  let response
  if (url.indexOf('/autocomplete?') > 0) {
    response = autocompleteResponse
  } else if (url.indexOf('/search?') > 0) {
    response = searchResponse
  }

  if (response) {
    return Promise.resolve(
      new window.Response(JSON.stringify(response), {
        status: 200,
        headers: {
          'Content-type': 'application/json'
        }
      })
    )
  } else {
    return Promise.resolve(
      new window.Response(undefined, {
        status: 500
      })
    )
  }
})

describe('GeoSearch', () => {
  window.fetch = mapzenSearchMock

  it('focuses the input after mounting', () => {
    const { getByPlaceholderText } = renderWithReduxAndIntl(<GeoSearch />)
    const input = getByPlaceholderText('Search for a location')
    expect(document.activeElement).toEqual(input)
  })

  it('displays a "clear search" button when there is input', () => {
    const { queryByTitle, getByPlaceholderText } = renderWithReduxAndIntl(
      <GeoSearch />
    )
    const input = getByPlaceholderText('Search for a location')

    // The close button should not render when the input is empty
    expect(queryByTitle('Clear search')).not.toBeInTheDocument()

    // Simulates input, which should also trigger events
    fireEvent.change(input, { target: { value: 'f' } })

    // The close button should appear after one keystroke
    expect(queryByTitle('Clear search')).toBeInTheDocument()

    // Deletes input
    fireEvent.change(input, { target: { value: '' } })

    // The close button should now disappear
    expect(queryByTitle('Clear search')).not.toBeInTheDocument()
  })

  it('clears and focuses input when "clear search" button is clicked', () => {
    const {
      getByTitle,
      queryByTitle,
      getByPlaceholderText
    } = renderWithReduxAndIntl(<GeoSearch />)

    // Simulates input
    const input = getByPlaceholderText('Search for a location')
    fireEvent.change(input, { target: { value: 'foo' } })

    // Simulates click on "clear search"
    fireEvent.click(getByTitle('Clear search'))

    // The close button should be undefined now
    expect(queryByTitle('Clear search')).not.toBeInTheDocument()

    // The input should be empty and it should be focused
    expect(input.value).toEqual('')
    expect(input).toEqual(document.activeElement)
  })
})
