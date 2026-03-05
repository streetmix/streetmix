import { vi } from 'vitest'
import MockAdapter from 'axios-mock-adapter'

import { render } from '~/test/helpers/render.js'
import apiClient from '~/src/util/api.js'
import { WelcomePanel } from './WelcomePanel.js'

vi.mock('../../users/authentication.js')
vi.mock('../mode.js')

describe('WelcomePanel', () => {
  let apiMock: MockAdapter

  beforeEach(() => {
    apiMock = new MockAdapter(apiClient.client)
  })

  afterEach(() => {
    apiMock.restore()
  })

  it('does not show if app is read-only', () => {
    const { container } = render(<WelcomePanel />, {
      initialState: {
        app: {
          readOnly: true,
        },
      },
    })

    expect(container).toBeEmptyDOMElement()
  })

  it('shows in Coastmix mode', () => {
    const { queryByText } = render(<WelcomePanel />, {
      initialState: {
        flags: {
          COASTMIX_MODE: {
            value: true,
          },
        },
      },
    })

    expect(queryByText('Welcome to Coastmix!')).toBeInTheDocument()
  })
})
