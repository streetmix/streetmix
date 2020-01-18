/* eslint-env jest */
import React from 'react'
import { fireEvent } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import StreetNameplateContainer from '../StreetNameplateContainer'

const initialState = {
  ui: {
    streetNameplateVisible: true
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
})
