/* eslint-env jest */
import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import ContactMenu from '../ContactMenu'
import { showDialog } from '../../store/slices/dialogs'

jest.mock('../../store/slices/dialogs', () => ({
  showDialog: jest.fn(() => ({ type: 'MOCK_ACTION' }))
}))

describe('ContactMenu', () => {
  it('renders', () => {
    const { asFragment } = renderWithReduxAndIntl(<ContactMenu />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('handles clicked menu items', () => {
    renderWithReduxAndIntl(<ContactMenu />)

    fireEvent.click(screen.getByText('Discord', { exact: false }))
    fireEvent.click(screen.getByText('GitHub', { exact: false }))
    fireEvent.click(screen.getByText('newsletter', { exact: false }))

    expect(showDialog).toBeCalledTimes(1)
  })
})
