/* eslint-env jest */
import React from 'react'
import { fireEvent, cleanup, waitForElement } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import ConnectedWelcomePanel, { WelcomePanel } from '../WelcomePanel'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import { getMode } from '../mode'
import { isSignedIn } from '../../users/authentication'
import apiClient from '../../util/api'
import { everythingLoaded } from '../../store/actions/app'

jest.mock('../mode')
jest.mock('../keypress')
jest.mock('../../users/authentication')

describe('WelcomePanel', () => {
  let apiMock

  beforeEach(() => {
    apiMock = new MockAdapter(apiClient.client)
  })

  afterEach(() => {
    apiMock.restore()
    cleanup()
  })

  it('does not show if app is read-only', () => {
    const wrapper = renderWithReduxAndIntl(<WelcomePanel readOnly />)
    expect(wrapper.container.firstChild).toEqual(null)
  })

  describe('start with a copy of previous street', () => {
    const originalStreetId = '2'
    const type = 'streetcar'
    const variantString = 'inbound|regular'
    const segment = { variantString, id: '1', width: 400, randSeed: 1, type }
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
      getMode.mockImplementation(() => (2)) // NEW_STREET
      isSignedIn.mockImplementation(() => (true))
    })

    it('copies the last street and highlights Start with a copy button', async () => {
      const { queryByLabelText, getByLabelText, store } = renderWithReduxAndIntl(<ConnectedWelcomePanel />, { initialState: { street, settings: { priorLastStreetId: '2' }, app: { everythingLoaded: false } } })
      store.dispatch(everythingLoaded())
      apiMock.onAny().reply(200, apiResponse)
      fireEvent.click(getByLabelText(/Start with a copy/))
      const input = await waitForElement(() => queryByLabelText(/Start with a copy/))
      expect(input.checked).toBe(true)
    })
  })
})
