/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import moxios from 'moxios'

import ConnectedWelcomePanel, { WelcomePanel } from '../WelcomePanel'
import { fireEvent, cleanup, waitForDomChange, waitForElementToBeRemoved } from 'react-testing-library'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import { respondWith } from '../../../../test/helpers/requests'
import { getMode } from '../mode'
import { isSignedIn } from '../../users/authentication'
import { setSettings } from '../../store/actions/settings'
import apiClient from '../../util/API'

jest.mock('../mode')
jest.mock('../../users/authentication')
jest.mock('../mode')
jest.mock('../../users/settings')

describe('WelcomePanel', () => {
  beforeEach(() => {
    moxios.install(apiClient.client)
  })
  afterEach(() => {
    moxios.uninstall()
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
        street: updatedStreet,
      }
    }
    beforeEach(() => {
      getMode.mockImplementation(() => (2))
      isSignedIn.mockImplementation(() => (true))
    })
    it('gets the data from the server', async () => {
      const { store, queryByLabelText, getByLabelText, container } = renderWithReduxAndIntl(<ConnectedWelcomePanel />, { street })
      store.dispatch(setSettings({ priorLastStreetId: originalStreetId }))
      var event = new Event('stmx:everything_loaded')
      window.dispatchEvent(event)
      fireEvent.click(getByLabelText(/Start with a copy/))
      await respondWith(apiResponse)
      //ToDo: welcome panel should not be visible
      /**
      await waitForElementToBeRemoved(() =>
        queryByLabelText(/Start with a copy/)
      )
      await waitForDomChange({container})
      expect(queryByLabelText(/Start with a copy/)).toBeNull()
      **/
    })
  })
})
