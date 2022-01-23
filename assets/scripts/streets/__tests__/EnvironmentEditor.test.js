/* eslint-env jest */
import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../../../test/helpers/render'
import * as uiSlice from '../../store/slices/ui'
import EnvironmentEditor from '../EnvironmentEditor'

// jest.mock('../../store/slices/ui', () => ({
//   toggleToolbox: jest.fn(() => ({ type: 'MOCK_ACTION' }))
// }))

describe('EnvironmentEditor', () => {
  const initialState = {
    street: {
      environment: null
    },
    ui: {
      toolboxVisible: true
    },
    user: {
      isSubscriber: true
    }
  }

  it('renders for subscribers', () => {
    const { asFragment } = render(<EnvironmentEditor />, {
      initialState
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it.todo('selects an environment')

  it.skip('closes when close button is clicked', () => {
    render(<EnvironmentEditor />, { initialState })

    // Mock the single action creator to test if it's called
    // We cannot mock the entire module because it prevents the test store
    // from being created (the slice is responsible for both store and actions)
    // ESLint does not like that we are assigning to the imported function
    // so disable it so that we don't see that warning
    // The action creator itself doesn't do anything but it must still return
    // a plain object or the dispatch() throws an error
    // eslint-disable-next-line
    uiSlice.toggleToolbox = jest.fn().mockReturnValue({ type: 'MOCK_ACTION' })

    waitFor(() => {
      userEvent.click(screen.getByTitle('Dismiss'))
    })

    expect(uiSlice.toggleToolbox).toBeCalled()
  })

  it.skip('shows upgrade prompt for unsubscribed users', () => {
    render(<EnvironmentEditor />, {
      initialState: {
        ...initialState,
        user: {
          signedIn: true
        }
      }
    })
    expect(screen.queryByText('Upgrade to unlock')).toBeInTheDocument()
  })

  it.skip('shows sign in button for unsubscribed, unsigned-in users', () => {
    render(<EnvironmentEditor />, {
      initialState: {
        ...initialState,
        user: {}
      }
    })
    expect(screen.queryByText('Sign in')).toBeInTheDocument()
  })

  it.todo('does not select an environment for unsubscribed users')
})
