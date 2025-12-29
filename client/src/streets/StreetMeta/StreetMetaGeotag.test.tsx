import { vi } from 'vitest'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render.js'
import { showDialog } from '~/src/store/slices/dialogs.js'
import { StreetMetaGeotag } from './StreetMetaGeotag.js'

vi.mock('~/src/store/slices/dialogs.js', () => ({
  default: {},
  showDialog: vi.fn(() => ({ type: 'MOCK_ACTION' })),
}))

describe('StreetMetaGeotag', () => {
  afterEach(() => {
    // Resets mock call counter between tests
    vi.clearAllMocks()
  })

  it('renders placeholder label and opens dialog if location is editable (it is by default)', async () => {
    const { getByText } = render(<StreetMetaGeotag />, {
      initialState: {
        street: {
          location: null,
        },
      },
    })

    await userEvent.click(getByText('Add location'))
    expect(showDialog).toBeCalledTimes(1)
  })

  it('renders nothing if location is not set and is not editable', () => {
    const { queryByText } = render(<StreetMetaGeotag />, {
      initialState: {
        street: {},
        app: { readOnly: true },
        flags: { GEOTAG: { value: false } },
      },
    })

    expect(queryByText('Add location')).toBe(null)
    expect(showDialog).toBeCalledTimes(0)
  })

  it('renders location label and opens dialog if location is editable', async () => {
    const { getByText } = render(<StreetMetaGeotag />, {
      initialState: {
        street: {
          location: {
            hierarchy: {
              locality: 'foo',
              country: 'bar',
            },
          },
        },
        app: { readOnly: false },
        flags: { GEOTAG: { value: true } },
      },
    })

    await userEvent.click(getByText('foo, bar'))
    expect(showDialog).toBeCalledTimes(1)
  })

  it('renders location label but does nothing on click if location is not editable', async () => {
    const { getByText } = render(<StreetMetaGeotag />, {
      initialState: {
        street: {
          location: {
            hierarchy: {
              locality: 'foo',
              country: 'bar',
            },
          },
        },
        app: { readOnly: true },
        flags: { GEOTAG: { value: true } },
      },
    })

    await userEvent.click(getByText('foo, bar'))
    expect(showDialog).toBeCalledTimes(0)
  })

  it('displays the correct label for a given location hierarchy', () => {
    const { queryByText } = render(<StreetMetaGeotag />, {
      initialState: {
        street: {
          location: {
            hierarchy: {
              neighbourhood: 'baz',
              region: 'bar',
              street: 'qux',
            },
          },
        },
      },
    })

    // No locality, but with region and neighbourhood,
    // expect region to be displayed
    expect(queryByText('bar')).toBeInTheDocument()
  })
})
