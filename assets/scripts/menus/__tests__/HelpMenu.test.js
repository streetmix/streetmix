/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import HelpMenu from '../HelpMenu'
import { showDialog } from '../../store/slices/dialogs'

jest.mock('../../store/slices/dialogs', () => ({
  // We don't use these actions for anything, but they must return
  // a plain object or the dispatch() throws an error
  showDialog: jest.fn((id) => ({ type: 'MOCK_ACTION' }))
}))

describe('HelpMenu', () => {
  afterEach(() => {
    // Resets mock call counter between tests
    showDialog.mockClear()
  })

  it('renders', () => {
    const { asFragment } = renderWithReduxAndIntl(<HelpMenu isActive={true} />)

    expect(asFragment()).toMatchSnapshot()
  })

  it('shows the About dialog when its link is clicked', () => {
    renderWithReduxAndIntl(<HelpMenu isActive={true} />)

    userEvent.click(screen.getByText('About Streetmix…'))

    expect(showDialog).toBeCalledTimes(1)
    expect(showDialog).toBeCalledWith('ABOUT')
  })

  it('shows the What’s New dialog when its link is clicked', () => {
    renderWithReduxAndIntl(<HelpMenu isActive={true} />)

    userEvent.click(
      screen.getByText('What’s new in Streetmix?', { exact: false })
    )

    expect(showDialog).toBeCalledTimes(1)
    expect(showDialog).toBeCalledWith('WHATS_NEW')
  })

  // To implement this test, we need to test that the `keydown`
  // event is listened to on the window. It's possible this is out
  // of scope for a unit test and should be captured in the
  // end-to-end acceptance testing instead.
  it.skip('shows the About dialog when keyboard shortcut is pressed', () => {
    renderWithReduxAndIntl(<HelpMenu isActive={true} />)

    userEvent.type('?')

    expect(showDialog).toBeCalledTimes(1)
    expect(showDialog).toBeCalledWith('ABOUT')
  })
})
