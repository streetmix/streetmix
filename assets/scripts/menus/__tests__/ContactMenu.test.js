/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import ContactMenu from '../ContactMenu'
import { showDialog } from '../../store/slices/dialogs'

jest.mock('../../store/slices/dialogs', () => ({
  showDialog: jest.fn(() => ({ type: 'MOCK_ACTION' }))
}))

describe('ContactMenu', () => {
  it('renders', () => {
    const { asFragment } = renderWithReduxAndIntl(
      <ContactMenu isActive={true} />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('handles clicked menu items', () => {
    renderWithReduxAndIntl(<ContactMenu isActive={true} />)

    userEvent.click(screen.getByText('Discord', { exact: false }))
    userEvent.click(screen.getByText('GitHub', { exact: false }))
    userEvent.click(screen.getByText('newsletter', { exact: false }))

    expect(showDialog).toBeCalledTimes(1)
  })
})
