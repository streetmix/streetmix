import { vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render.js'
import * as uiSlice from '~/src/store/slices/ui.js'
import { SkyPicker } from './SkyPicker.js'

vi.mock(
  '../skybox-defs.json',
  async () => await import('../__mocks__/skybox-defs.json')
)
vi.mock('../constants.js', () => ({ DEFAULT_SKYBOX: 'default' }))

describe('SkyPicker', () => {
  const initialState = {
    street: {
      skybox: null,
    },
    ui: {
      toolboxVisible: true,
    },
    user: {
      signedIn: true,
      isSubscriber: true,
    },
    // Simulate default feature flag state
    flags: {
      ENVIRONMENTS_UNLOCKED: {
        value: false,
      },
    },
  }

  it('renders for signed-in subscribers', () => {
    const { asFragment } = render(<SkyPicker />, {
      initialState,
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

    vi.spyOn(uiSlice, 'toggleToolbox')

    await userEvent.click(screen.getByTitle('Dismiss'))

    expect(uiSlice.toggleToolbox).toBeCalled()
  })

  it('shows Streetmix+ prompt', () => {
    render(<SkyPicker />, {
      initialState: {
        ...initialState,
      },
    })
    expect(screen.queryByText('Get Streetmix+')).not.toBeInTheDocument()
  })

  it('does not select a skybox for unsubscribed users', async () => {
    render(<SkyPicker />, {
      initialState: {
        ...initialState,
        user: {
          signedIn: true,
          isSubscriber: false,
        },
      },
    })

    // Initial state
    expect(screen.getByLabelText('Day')).toHaveClass('sky-selected')
    expect(screen.getByLabelText('Foo')).toBeDisabled()

    // waitFor animation to remove `pointer-events: none` from parent element
    // This test is flaky if we don't wait.
    await waitFor(async () => {
      await userEvent.click(screen.getByLabelText('Foo'))
    })

    // State should not change!
    expect(screen.getByLabelText('Day')).toHaveClass('sky-selected')
    expect(screen.getByLabelText('Foo')).not.toHaveClass('sky-selected')
    expect(screen.getByLabelText('Foo')).toBeDisabled()
  })
})
