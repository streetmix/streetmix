/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
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
  it('renders', () => {
    renderWithReduxAndIntl(<StreetNameplateContainer />, {
      initialState
    })
    expect(screen.getByText('foo')).toBeInTheDocument()
  })

  it('renders default street name', () => {
    renderWithReduxAndIntl(<StreetNameplateContainer />, {
      ...initialState,
      street: { name: null }
    })
    expect(screen.getByText('Unnamed St')).toBeInTheDocument()
  })

  it('handles click and name change', () => {
    // Mock window.prompt() and have it return a new name
    const mockPrompt = jest.spyOn(window, 'prompt')
    mockPrompt.mockImplementation(() => 'bar')

    // Mount, mimic click interaction and expect street name to have changed
    renderWithReduxAndIntl(<StreetNameplateContainer />, {
      initialState
    })
    userEvent.click(screen.getByText('foo'))
    expect(screen.getByText('bar')).toBeInTheDocument()

    // Restore mock
    mockPrompt.mockRestore()
  })

  it('doesn’t change the name if prompt returns empty string', () => {
    // Mock window.prompt() and have it return a new name
    const mockPrompt = jest.spyOn(window, 'prompt')
    mockPrompt.mockImplementation(() => '')

    // Mount, mimic click interaction and expect street name to have changed
    renderWithReduxAndIntl(<StreetNameplateContainer />, {
      initialState
    })
    userEvent.click(screen.getByText('foo'))
    expect(screen.getByText('foo')).toBeInTheDocument()

    // Restore mock
    mockPrompt.mockRestore()
  })

  it('shows a "Click to edit" message when mouse is hovering over it', () => {
    renderWithReduxAndIntl(<StreetNameplateContainer />, {
      initialState
    })

    userEvent.hover(screen.getByText('foo'))
    expect(screen.getByText('Click to rename')).toBeInTheDocument()

    userEvent.unhover(screen.getByText('foo'))
    expect(screen.queryByText('Click to rename')).not.toBeInTheDocument()
  })

  it('does not show a "Click to edit" message when street name is not editable', () => {
    renderWithReduxAndIntl(<StreetNameplateContainer />, {
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

    userEvent.hover(screen.getByText('foo'))
    expect(screen.queryByText('Click to rename')).not.toBeInTheDocument()

    userEvent.unhover(screen.getByText('foo'))
    expect(screen.queryByText('Click to rename')).not.toBeInTheDocument()
  })
})
