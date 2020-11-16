/* eslint-env jest */
import React from 'react'
import userEvent from '@testing-library/user-event'
import StreetMetaAnalytics from '../StreetMetaAnalytics'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import { showDialog } from '../../store/slices/dialogs'

jest.mock('../../store/slices/dialogs', () => ({
  showDialog: jest.fn(() => ({ type: 'MOCK_ACTION' }))
}))

describe('StreetMetaAnalytics', () => {
  afterEach(() => {
    // Resets mock call counter between tests
    showDialog.mockClear()
  })

  it('renders analytics and opens a dialog when clicked', () => {
    const { getByText } = renderWithReduxAndIntl(<StreetMetaAnalytics />, {
      initialState: {
        street: {
          segments: [
            {
              type: 'sidewalk',
              width: 6
            },
            {
              type: 'bus-lane',
              width: 12
            }
          ]
        },
        locale: {
          locale: 'en'
        }
      }
    })

    userEvent.click(getByText('20,000 people/hr'))
    expect(showDialog).toBeCalledTimes(1)
  })
})
