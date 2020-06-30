/* eslint-env jest */
import React from 'react'
import { fireEvent } from '@testing-library/react'
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
    const wrapper = renderWithReduxAndIntl(<StreetNameplateContainer />, {
      initialState
    })
    expect(wrapper.getByText('foo')).toBeInTheDocument()
  })

  it('renders default street name', () => {
    const wrapper = renderWithReduxAndIntl(<StreetNameplateContainer />, {
      ...initialState,
      street: { name: null }
    })
    expect(wrapper.getByText('Unnamed St')).toBeInTheDocument()
  })

  it('handles click and name change', () => {
    // Mock window.prompt() and have it return a new name
    const mockPrompt = jest.spyOn(window, 'prompt')
    mockPrompt.mockImplementation(() => 'bar')

    // Mount, mimic click interaction and expect street name to have changed
    const wrapper = renderWithReduxAndIntl(<StreetNameplateContainer />, {
      initialState
    })
    fireEvent.click(wrapper.getByText('foo'))
    expect(wrapper.getByText('bar')).toBeInTheDocument()

    // Restore mock
    mockPrompt.mockRestore()
  })

  it('doesn’t change the name if prompt returns empty string', () => {
    // Mock window.prompt() and have it return a new name
    const mockPrompt = jest.spyOn(window, 'prompt')
    mockPrompt.mockImplementation(() => '')

    // Mount, mimic click interaction and expect street name to have changed
    const wrapper = renderWithReduxAndIntl(<StreetNameplateContainer />, {
      initialState
    })
    fireEvent.click(wrapper.getByText('foo'))
    expect(wrapper.getByText('foo')).toBeInTheDocument()

    // Restore mock
    mockPrompt.mockRestore()
  })

  it('shows a "Click to edit" message when mouse is hovering over it', () => {
    const wrapper = renderWithReduxAndIntl(<StreetNameplateContainer />, {
      initialState
    })

    fireEvent.mouseOver(wrapper.getByText('foo'))
    expect(wrapper.getByText('Click to rename')).toBeInTheDocument()

    fireEvent.mouseOut(wrapper.getByText('foo'))
    expect(wrapper.queryByText('Click to rename')).not.toBeInTheDocument()
  })

  it('does not show a "Click to edit" message when street name is not editable', () => {
    const wrapper = renderWithReduxAndIntl(<StreetNameplateContainer />, {
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

    fireEvent.mouseOver(wrapper.getByText('foo'))
    expect(wrapper.queryByText('Click to rename')).not.toBeInTheDocument()

    fireEvent.mouseOut(wrapper.getByText('foo'))
    expect(wrapper.queryByText('Click to rename')).not.toBeInTheDocument()
  })
})
