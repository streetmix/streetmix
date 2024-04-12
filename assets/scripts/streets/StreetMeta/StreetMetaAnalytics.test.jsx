import React from 'react'
import { vi } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import { render } from '../../test/helpers/render'
import { showDialog } from '../../store/slices/dialogs'
import StreetMetaAnalytics from './StreetMetaAnalytics'

vi.mock('../../store/slices/dialogs', () => ({
  default: {},
  showDialog: vi.fn(() => ({ type: 'MOCK_ACTION' }))
}))

describe('StreetMetaAnalytics', () => {
  afterEach(() => {
    // Resets mock call counter between tests
    showDialog.mockClear()
  })

  it('renders analytics and opens a dialog when clicked', async () => {
    const { getByText } = render(<StreetMetaAnalytics />, {
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

    await userEvent.click(getByText('20,000 people/hr'))
    expect(showDialog).toBeCalledTimes(1)
  })
})
