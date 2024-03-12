import { expect, jest } from '@jest/globals'
import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { render } from '../../../../test/helpers/render'
import * as uiSlice from '../../store/slices/ui'
import SkyPicker from './SkyPicker'

jest.mock('../skybox-defs.json', () =>
  require('../__mocks__/skybox-defs.json')
)
jest.mock('../constants', () => ({ DEFAULT_SKYBOX: 'default' }))

describe('SkyPicker', () => {
  const initialState = {
    street: {
      skybox: null
    },
    ui: {
      toolboxVisible: true
    },
    user: {
      signedIn: true,
      isSubscriber: true
    }
  }

  it('renders for signed-in subscribers', () => {
    const { asFragment } = render(<SkyPicker />, {
      initialState
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('selects a skybox', async () => {
    render(<SkyPicker />, { initialState })

    // Initial state
    expect(screen.getByLabelText('Day')).toHaveClass('sky-selected')

    // waitFor animation to remove `pointer-events: none` from parent element
    // This test is flaky if we don't wait.
    await waitFor(async () => {
      await userEvent.click(screen.getByLabelText('Foo'))
    })

    // New state
    expect(screen.getByLabelText('Foo')).toHaveClass('sky-selected')
  })

  it('closes when close button is clicked', async () => {
    render(<SkyPicker />, { initialState })

    // Mock the single action creator to test if it's called
    // We cannot mock the entire module because it prevents the test store
    // from being created (the slice is responsible for both store and actions)
    // ESLint does not like that we are assigning to the imported function
    // so disable it so that we don't see that warning
    // The action creator itself doesn't do anything but it must still return
    // a plain object or the dispatch() throws an error
    // eslint-disable-next-line
    uiSlice.toggleToolbox = jest.fn().mockReturnValue({ type: "MOCK_ACTION" });

    // waitFor animation to remove `pointer-events: none` from parent element
    // This test is flaky if we don't wait.
    await waitFor(async () => {
      await userEvent.click(screen.getByTitle('Dismiss'))
    })

    expect(uiSlice.toggleToolbox).toBeCalled()
  })

  it('shows Streetmix+ prompt', () => {
    render(<SkyPicker />, {
      initialState: {
        ...initialState
      }
    })
    expect(screen.queryByText('Get Streetmix+')).not.toBeInTheDocument()
  })

  it('does not select a skybox for unsubscribed users', async () => {
    render(<SkyPicker />, {
      initialState: {
        ...initialState,
        user: {
          signedIn: true,
          isSubscriber: false
        }
      }
    })

    // Initial state
    expect(screen.getByLabelText('Day')).toHaveClass('sky-selected')
    expect(screen.getByLabelText('Foo')).toHaveClass('sky-disabled')

    // waitFor animation to remove `pointer-events: none` from parent element
    // This test is flaky if we don't wait.
    await waitFor(async () => {
      await userEvent.click(screen.getByLabelText('Foo'))
    })

    // State should not change!
    expect(screen.getByLabelText('Day')).toHaveClass('sky-selected')
    expect(screen.getByLabelText('Foo')).not.toHaveClass('sky-selected')
    expect(screen.getByLabelText('Foo')).toHaveClass('sky-disabled')
  })
})
