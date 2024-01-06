/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { render } from '../../../../test/helpers/render'
import ContactMenu from '../ContactMenu'
import { showDialog } from '../../store/slices/dialogs'

jest.mock('../../store/slices/dialogs', () => ({
  showDialog: jest.fn(() => ({ type: 'MOCK_ACTION' }))
}))

describe('ContactMenu', () => {
  it('renders', () => {
    const { asFragment } = render(<ContactMenu isActive={true} />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('handles clicked menu items', async () => {
    render(<ContactMenu isActive={true} />)

    await userEvent.click(screen.getByText('Discord', { exact: false }))
    await userEvent.click(screen.getByText('GitHub', { exact: false }))
    await userEvent.click(screen.getByText('newsletter', { exact: false }))

    expect(showDialog).toBeCalledTimes(1)
  })
})
