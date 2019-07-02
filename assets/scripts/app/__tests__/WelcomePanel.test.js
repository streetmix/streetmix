/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import MockAdapter from 'axios-mock-adapter'

import ConnectedWelcomePanel, { WelcomePanel } from '../WelcomePanel'
import { fireEvent, cleanup, waitForElement } from 'react-testing-library'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import { getMode } from '../mode'
import { isSignedIn } from '../../users/authentication'
import apiClient from '../../util/api'

jest.mock('../mode')
jest.mock('../../users/authentication')
jest.mock('../../users/settings')

describe('WelcomePanel', () => {
  let apiMock
  beforeEach(() => {
    apiMock = new MockAdapter(apiClient.client)
  })
  afterEach(() => {
    apiMock.restore()
    cleanup()
  })
  // Note: this test will always pass because of how this component's lifecycle works
  it('does not show if app is read-only', () => {
    const wrapper = shallow(<WelcomePanel readOnly />)
    expect(wrapper.state().visible).toBe(false)
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
      const { queryByLabelText, getByLabelText } = renderWithReduxAndIntl(<ConnectedWelcomePanel />, { initialState: { street, settings: { priorLastStreetId: '2' } } })
      var event = new Event('stmx:everything_loaded')
      window.dispatchEvent(event)
      apiMock.onAny().reply(200, apiResponse)
      fireEvent.click(getByLabelText(/Start with a copy/))
      const input = await waitForElement(() => queryByLabelText(/Start with a copy/))
      expect(input.checked).toBe(true)
    })
  })
})
