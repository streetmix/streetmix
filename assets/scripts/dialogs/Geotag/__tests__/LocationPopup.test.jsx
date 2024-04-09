import React from 'react'
import { vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { render } from '../../../../../test/helpers/render'
import LocationPopup from '../LocationPopup'

// Mock the <Popup /> component of react-leaflet so that it doesn't
// run its own side-effects; we only want to render as a wrapper
vi.mock('react-leaflet', () => {
  return { Popup: vi.fn(({ children }) => children) }
})

describe('LocationPopup', () => {
  it('does not render if a location is not provided', () => {
    const { container } = render(<LocationPopup />)
    // react-leaflet's <Popup /> should not exist
    expect(container.firstChild).toBe(null)
  })

  it('renders an address label', () => {
    render(<LocationPopup position={{ lat: 0, lng: 0 }} label="foo" />)

    // Expect the text to be visible
    expect(screen.getByText('foo')).not.toBe(null)
  })

  it('renders a confirm button if location is editable', async () => {
    const handleConfirm = vi.fn()
    const handleClear = vi.fn()

    render(
      <LocationPopup
        position={{ lat: 0, lng: 0 }}
        isEditable={true}
        handleConfirm={handleConfirm}
      />
    )

    // Button should exist and has the correct label
    // When button is clicked, `handleConfirm` should be called
    await userEvent.click(screen.getByText('Confirm location'))
    expect(handleConfirm).toHaveBeenCalled()
    expect(handleClear).toHaveBeenCalledTimes(0)
  })

  it('renders a clear button if location is clearable', async () => {
    const handleConfirm = vi.fn()
    const handleClear = vi.fn()

    render(
      <LocationPopup
        position={{ lat: 0, lng: 0 }}
        isEditable={true}
        isClearable={true}
        handleClear={handleClear}
      />
    )
    // Button should exist and has the correct label
    // When button is clicked, `handleClear` should be called
    await userEvent.click(screen.getByText('Clear location'))
    expect(handleClear).toHaveBeenCalled()
    expect(handleConfirm).toHaveBeenCalledTimes(0)
  })
})
