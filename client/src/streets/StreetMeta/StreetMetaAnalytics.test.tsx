import { vi } from 'vitest'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render.js'
import { showDialog } from '~/src/store/slices/dialogs.js'
import { StreetMetaAnalytics } from './StreetMetaAnalytics.js'

vi.mock('~/src/store/slices/dialogs.js', () => ({
  default: {},
  showDialog: vi.fn(() => ({ type: 'MOCK_ACTION' })),
}))

describe('StreetMetaAnalytics', () => {
  afterEach(() => {
    // Resets mock call counter between tests
    vi.clearAllMocks()
  })

  it('renders analytics and opens a dialog when clicked', async () => {
    const { getByText } = render(<StreetMetaAnalytics />, {
      initialState: {
        street: {
          segments: [
            {
              type: 'sidewalk',
              width: 6,
              warnings: [],
            },
            {
              type: 'bus-lane',
              width: 12,
              warnings: [],
            },
          ],
        },
        locale: {
          locale: 'en',
        },
      },
    })

    await userEvent.click(getByText('20,000 people/hr'))
    expect(showDialog).toBeCalledTimes(1)
  })
})
