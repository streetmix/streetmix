/* eslint-env jest */
import React from 'react'
import userEvent from '@testing-library/user-event'
import StreetMetaGeotag from '../StreetMetaGeotag'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import { showDialog } from '../../store/slices/dialogs'

jest.mock('../../store/slices/dialogs', () => ({
  showDialog: jest.fn(() => ({ type: 'MOCK_ACTION' }))
}))

describe('StreetMetaGeotag', () => {
  afterEach(() => {
    // Resets mock call counter between tests
    showDialog.mockClear()
  })

  it('renders placeholder label and opens dialog if location is editable (it is by default)', () => {
    const { getByText } = renderWithReduxAndIntl(<StreetMetaGeotag />, {
      initialState: {
        street: {}
      }
    })

    userEvent.click(getByText('Add location'))
    expect(showDialog).toBeCalledTimes(1)
  })

  it('renders nothing if location is not set and is not editable', () => {
    const { queryByText } = renderWithReduxAndIntl(<StreetMetaGeotag />, {
      initialState: {
        street: {},
        app: { readOnly: true },
        flags: { GEOTAG: { value: false } }
      }
    })

    expect(queryByText('Add location')).toBe(null)
    expect(showDialog).toBeCalledTimes(0)
  })

  it('renders location label and opens dialog if location is editable', () => {
    const { getByText } = renderWithReduxAndIntl(<StreetMetaGeotag />, {
      initialState: {
        street: {
          location: {
            hierarchy: {
              locality: 'foo',
              country: 'bar'
            }
          }
        },
        app: { readOnly: false },
        flags: { GEOTAG: { value: true } }
      }
    })

    userEvent.click(getByText('foo, bar'))
    expect(showDialog).toBeCalledTimes(1)
  })

  it('renders location label but does nothing on click if location is not editable', () => {
    const { getByText } = renderWithReduxAndIntl(<StreetMetaGeotag />, {
      initialState: {
        street: {
          location: {
            hierarchy: {
              locality: 'foo',
              country: 'bar'
            }
          }
        },
        app: { readOnly: true },
        flags: { GEOTAG: { value: true } }
      }
    })

    userEvent.click(getByText('foo, bar'))
    expect(showDialog).toBeCalledTimes(0)
  })

  it.todo('displays the correct label for a given location hierarchy')
})
