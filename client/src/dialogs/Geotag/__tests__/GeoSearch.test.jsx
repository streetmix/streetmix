import React from 'react'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render'
import GeoSearch from '../GeoSearch'

describe('GeoSearch', () => {
  it('focuses the input after mounting', () => {
    render(<GeoSearch />)
    const input = screen.getByPlaceholderText('Search for a location')
    expect(document.activeElement).toEqual(input)
  })

  it('displays a "clear search" button when there is input', async () => {
    render(<GeoSearch />)
    const input = screen.getByPlaceholderText('Search for a location')

    // The close button should not render when the input is empty
    expect(screen.queryByTitle('Clear search')).not.toBeInTheDocument()

    // Simulates input, which should also trigger events
    await userEvent.type(input, 'f')

    // The close button should appear after one keystroke
    expect(screen.queryByTitle('Clear search')).toBeInTheDocument()

    // Deletes input
    await userEvent.clear(input)

    // The close button should now disappear
    expect(screen.queryByTitle('Clear search')).not.toBeInTheDocument()
  })

  it('clears and focuses input when "clear search" button is clicked', async () => {
    const { getByTitle, queryByTitle, getByPlaceholderText } = render(
      <GeoSearch />
    )

    // Simulates input
    const input = getByPlaceholderText('Search for a location')
    await userEvent.type(input, 'foo')

    // Simulates click on "clear search"
    await userEvent.click(getByTitle('Clear search'))

    // The close button should be undefined now
    expect(queryByTitle('Clear search')).not.toBeInTheDocument()

    // The input should be empty and it should be focused
    expect(input.value).toEqual('')
    expect(input).toEqual(document.activeElement)
  })
})
