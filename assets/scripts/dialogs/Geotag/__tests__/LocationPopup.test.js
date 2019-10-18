/* eslint-env jest */
import React from 'react'
import { fireEvent } from '@testing-library/react'
import { renderWithIntl } from '../../../../../test/helpers/render'
import LocationPopup from '../LocationPopup'

// Mock the <Popup /> component of react-leaflet so that it doesn't
// run its own side-effects; we only want to render as a wrapper
jest.mock('react-leaflet', () => {
  return { Popup: jest.fn(({ children }) => children) }
})

describe('LocationPopup', () => {
  it('does not render if a location is not provided', () => {
    const wrapper = renderWithIntl(<LocationPopup />)

    // react-leaflet's <Popup /> should not exist
    expect(wrapper.asFragment().firstChild).toBe(null)
  })

  it('renders an address label', () => {
    const wrapper = renderWithIntl(
      <LocationPopup position={{ lat: 0, lng: 0 }} label="foo" />
    )

    // Expect the text to be visible
    expect(wrapper.getByText('foo')).not.toBe(null)
  })

  it('renders a confirm button if location is editable', () => {
    const handleConfirm = jest.fn()
    const handleClear = jest.fn()

    const wrapper = renderWithIntl(
      <LocationPopup
        position={{ lat: 0, lng: 0 }}
        isEditable
        handleConfirm={handleConfirm}
      />
    )

    // Button should exist and has the correct label
    // When button is clicked, `handleConfirm` should be called
    fireEvent.click(wrapper.getByText('Confirm location'))
    expect(handleConfirm).toHaveBeenCalled()
    expect(handleClear).toHaveBeenCalledTimes(0)
  })

  it('renders a clear button if location is clearable', () => {
    const handleConfirm = jest.fn()
    const handleClear = jest.fn()

    const wrapper = renderWithIntl(
      <LocationPopup
        position={{ lat: 0, lng: 0 }}
        isEditable
        isClearable
        handleClear={handleClear}
      />
    )

    // Button should exist and has the correct label
    // When button is clicked, `handleClear` should be called
    fireEvent.click(wrapper.getByText('Clear location'))
    expect(handleClear).toHaveBeenCalled()
    expect(handleConfirm).toHaveBeenCalledTimes(0)
  })
})
