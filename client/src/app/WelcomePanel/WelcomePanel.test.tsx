import React from 'react'
import { vi, type Mock } from 'vitest'
import { waitFor, act } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'

import { render } from '~/test/helpers/render'
import { everythingLoaded } from '~/src/store/slices/app'
import { isSignedIn } from '~/src/users/authentication'
import apiClient from '~/src/util/api'
import { getMode } from '../mode'
import WelcomePanel from './WelcomePanel'

vi.mock('../../users/authentication')
vi.mock('../mode')

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
          readOnly: true
        }
      }
    })

    expect(container).toBeEmptyDOMElement()
  })

  describe('start with a copy of previous street', () => {
    const originalStreetId = '2'
    const type = 'streetcar'
    const variantString = 'inbound|regular'
    const segment = { variantString, id: '1', width: 400, type }
    const street = {
      id: '3',
      namespaceId: '4',
      segments: [segment],
      width: 100
    }
    const updatedStreet = {
      segments: [segment, segment],
      width: 100
    }
    const apiResponse = {
      id: '3',
      originalStreetId,
      updatedAt: '',
      name: 'StreetName',
      data: {
        street: updatedStreet
      }
    }

    beforeEach(() => {
      (getMode as Mock).mockImplementation(() => 2); // NEW_STREET
      (isSignedIn as Mock).mockImplementation(() => true)
    })

    it('copies the last street and highlights Start with a copy button', async () => {
      const { getByLabelText, store } = render(<WelcomePanel />, {
        initialState: {
          street,
          app: {
            readOnly: false,
            everythingLoaded: false,
            priorLastStreetId: '2'
          }
        }
      })

      // Our actions must be wrapped in `act` because of state changes
      act(() => {
        store.dispatch(everythingLoaded())
        apiMock.onAny().reply(200, apiResponse)
      })

      await waitFor(async () => {
        const input = getByLabelText(/Start with a copy/) as HTMLInputElement
        await userEvent.click(input)
        expect(input.checked).toBe(true)
      })
    })
  })
})
