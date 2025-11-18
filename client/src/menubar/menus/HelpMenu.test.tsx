import React from 'react'
import { vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render'
import { showDialog } from '~/src/store/slices/dialogs'
import HelpMenu from './HelpMenu'

vi.mock('../../store/slices/dialogs', () => ({
  default: {},
  // We don't use these actions for anything, but they must return
  // a plain object or the dispatch() throws an error
  showDialog: vi.fn((_id) => ({ type: 'MOCK_ACTION' }))
}))

describe('HelpMenu', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders', () => {
    const { asFragment } = render(<HelpMenu isActive />)

    expect(asFragment()).toMatchSnapshot()
  })

  it('shows the About dialog when its link is clicked', async () => {
    render(<HelpMenu isActive />)

    await userEvent.click(screen.getByText('About Streetmix…'))

    expect(showDialog).toBeCalledTimes(1)
    expect(showDialog).toBeCalledWith('ABOUT')
  })

  it('shows the What’s New dialog when its link is clicked', async () => {
    render(<HelpMenu isActive />)

    await userEvent.click(screen.getByText('What’s new', { exact: false }))

    expect(showDialog).toBeCalledTimes(1)
    expect(showDialog).toBeCalledWith('WHATS_NEW')
  })

  // To implement this test, we need to test that the `keydown`
  // event is listened to on the window. It's possible this is out
  // of scope for a unit test and should be captured in the
  // end-to-end acceptance testing instead.
  it.skip('shows the About dialog when keyboard shortcut is pressed', async () => {
    render(<HelpMenu isActive />)

    await userEvent.keyboard('?')

    expect(showDialog).toBeCalledTimes(1)
    expect(showDialog).toBeCalledWith('ABOUT')
  })
})
