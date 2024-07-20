import React from 'react'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render'
import GeoSearch from './GeoSearch'

const baseProps = {
  handleSearchResults: () => {},
  focus: { lat: 0, lng: 0 }
}

describe('GeoSearch', () => {
  it('focuses the input after mounting', () => {
    render(<GeoSearch {...baseProps} />)
    const input = screen.getByPlaceholderText('Search for a location')
    expect(document.activeElement).toEqual(input)
  })

  it('displays a "clear search" button when there is input', async () => {
    const user = userEvent.setup()

    render(<GeoSearch {...baseProps} />)
    const input = screen.getByPlaceholderText('Search for a location')

    // The close button should not render when the input is empty
    expect(screen.queryByTitle('Clear search')).not.toBeInTheDocument()

    // Simulates input, which should also trigger events
    await user.type(input, 'f')

    // The close button should appear after one keystroke
    expect(screen.queryByTitle('Clear search')).toBeInTheDocument()

    // Deletes input
    await user.clear(input)

    // The close button should now disappear
    expect(screen.queryByTitle('Clear search')).not.toBeInTheDocument()
  })

  it('clears and focuses input when "clear search" button is clicked', async () => {
    const user = userEvent.setup()

    const { getByTitle, queryByTitle, getByPlaceholderText } = render(
      <GeoSearch {...baseProps} />
    )

    // Simulates input
    const input = getByPlaceholderText(
      'Search for a location'
    ) as HTMLInputElement
    await user.type(input, 'foo')

    // Simulates click on "clear search"
    await user.click(getByTitle('Clear search'))

    // The close button should be undefined now
    expect(queryByTitle('Clear search')).not.toBeInTheDocument()

    // The input should be empty and it should be focused
    expect(input.value).toEqual('')
    expect(input).toEqual(document.activeElement)
  })
})
