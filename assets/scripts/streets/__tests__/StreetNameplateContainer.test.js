/* eslint-env jest */
import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { render } from '../../../../test/helpers/render'
import StreetNameplateContainer from '../StreetNameplateContainer'

const initialState = {
  ui: {
    welcomePanelVisible: false
  },
  app: {
    readOnly: false
  },
  flags: {
    EDIT_STREET_NAME: {
      value: true
    },
    EDIT_STREET_WIDTH: {
      value: true
    },
    GEOTAG: {
      value: true
    }
  },
  street: {
    name: 'foo'
  }
}

describe('StreetNameplateContainer', () => {
  it('renders', async () => {
    render(<StreetNameplateContainer />, {
      initialState
    })

    await waitFor(() => {
      expect(screen.getByText('foo')).toBeInTheDocument()
    })
  })

  it('renders default street name', async () => {
    render(<StreetNameplateContainer />, {
      ...initialState,
      street: { name: null }
    })

    await waitFor(() => {
      expect(screen.getByText('Unnamed St')).toBeInTheDocument()
    })
  })

  it('handles click and name change', async () => {
    // Mock window.prompt() and have it return a new name
    const mockPrompt = jest.spyOn(window, 'prompt')
    mockPrompt.mockImplementation(() => 'bar')

    // Mount, mimic click interaction and expect street name to have changed
    render(<StreetNameplateContainer />, {
      initialState
    })
    await userEvent.click(screen.getByText('foo'))
    expect(screen.getByText('bar')).toBeInTheDocument()

    // Restore mock
    mockPrompt.mockRestore()
  })

  it('doesn’t change the name if prompt returns empty string', async () => {
    // Mock window.prompt() and have it return a new name
    const mockPrompt = jest.spyOn(window, 'prompt')
    mockPrompt.mockImplementation(() => '')

    // Mount, mimic click interaction and expect street name to have changed
    render(<StreetNameplateContainer />, {
      initialState
    })
    await userEvent.click(screen.getByText('foo'))
    expect(screen.getByText('foo')).toBeInTheDocument()

    // Restore mock
    mockPrompt.mockRestore()
  })

  it('shows a "Click to edit" message when mouse is hovering over it', async () => {
    render(<StreetNameplateContainer />, {
      initialState
    })

    await userEvent.hover(screen.getByText('foo'))
    expect(screen.getByText('Click to rename')).toBeInTheDocument()

    await userEvent.unhover(screen.getByText('foo'))
    expect(screen.queryByText('Click to rename')).not.toBeInTheDocument()
  })

  it('does not show a "Click to edit" message when street name is not editable', async () => {
    render(<StreetNameplateContainer />, {
      initialState: {
        ...initialState,
        flags: {
          ...initialState.flags,
          EDIT_STREET_NAME: {
            value: false
          }
        }
      }
    })

    await userEvent.hover(screen.getByText('foo'))
    expect(screen.queryByText('Click to rename')).not.toBeInTheDocument()

    await userEvent.unhover(screen.getByText('foo'))
    expect(screen.queryByText('Click to rename')).not.toBeInTheDocument()
  })
})
