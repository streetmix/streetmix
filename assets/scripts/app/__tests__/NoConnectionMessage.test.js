/* eslint-env jest */
import React from 'react'
import { fireEvent } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import NoConnectionMessage from '../NoConnectionMessage'
import { nonblockingAjaxTryAgain } from '../../util/fetch_nonblocking'
import { showNoConnectionMessage } from '../../store/actions/status'

jest.mock('../../util/fetch_nonblocking', () => ({
  nonblockingAjaxTryAgain: jest.fn()
}))

const initialState = {
  status: {
    noConnectionMessage: false
  }
}

describe('NoConnectionMessage', () => {
  it('tries to reconnect when button is clicked', () => {
    const wrapper = renderWithReduxAndIntl(<NoConnectionMessage />, {
      initialState
    })
    fireEvent.click(wrapper.getByText('Try again'))
    expect(nonblockingAjaxTryAgain).toHaveBeenCalled()
  })

  it('does not have the visibility class when mounted', () => {
    const wrapper = renderWithReduxAndIntl(<NoConnectionMessage />, {
      initialState
    })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('applies visibility class when scheduled', () => {
    // Make setTimeouts run automatically
    jest.useFakeTimers()

    const wrapper = renderWithReduxAndIntl(<NoConnectionMessage />, {
      initialState
    })

    // Schedule the message to appear
    wrapper.store.dispatch(showNoConnectionMessage(true))

    // Run timers, then checking visibility
    jest.runAllTimers()
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it.todo('removes visibility class when connectivity returns')
})
